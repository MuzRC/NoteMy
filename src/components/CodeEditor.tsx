import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
} from 'lucide-react';
import { FileItem, EditorTheme, EditorSettings, CursorPosition } from '../types/editor';
import { highlightCode } from '../utils/syntaxHighlighter';

export interface CodeEditorHandle {
  insertText: (text: string, cursorOffset?: number) => void;
  undo: () => void;
  redo: () => void;
  formatCode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  focus: () => void;
}

interface CodeEditorProps {
  file: FileItem;
  theme: EditorTheme;
  settings: EditorSettings;
  isSearchOpen: boolean;
  onCloseSearch: () => void;
  onChangeContent: (content: string) => void;
  onCursorChange?: (pos: CursorPosition) => void;
  onUndoStateChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  (
    {
      file,
      theme,
      settings,
      isSearchOpen,
      onCloseSearch,
      onChangeContent,
      onCursorChange,
      onUndoStateChange,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);

    // History stack for Undo / Redo
    const [history, setHistory] = useState<string[]>([file.content]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const isInternalChange = useRef(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

    // Sync history when switching files
    useEffect(() => {
      setHistory([file.content]);
      setHistoryIndex(0);
      onUndoStateChange?.(false, false);
    }, [file.id]);

    const pushHistory = useCallback(
      (newContent: string) => {
        setHistory((prev) => {
          const updated = prev.slice(0, historyIndex + 1);
          updated.push(newContent);
          // Limit history to 50 items
          if (updated.length > 50) updated.shift();
          return updated;
        });
        setHistoryIndex((prev) => {
          const newIdx = Math.min(prev + 1, 49);
          onUndoStateChange?.(newIdx > 0, false);
          return newIdx;
        });
      },
      [historyIndex, onUndoStateChange]
    );

    const handleUndo = useCallback(() => {
      if (historyIndex > 0) {
        const targetIndex = historyIndex - 1;
        const prevContent = history[targetIndex];
        isInternalChange.current = true;
        onChangeContent(prevContent);
        setHistoryIndex(targetIndex);
        onUndoStateChange?.(targetIndex > 0, true);
      }
    }, [history, historyIndex, onChangeContent, onUndoStateChange]);

    const handleRedo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const targetIndex = historyIndex + 1;
        const nextContent = history[targetIndex];
        isInternalChange.current = true;
        onChangeContent(nextContent);
        setHistoryIndex(targetIndex);
        onUndoStateChange?.(true, targetIndex < history.length - 1);
      }
    }, [history, historyIndex, onChangeContent, onUndoStateChange]);

    const insertTextAtCursor = useCallback(
      (text: string, cursorOffset: number = 0) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = textarea.value;

        const updated =
          currentContent.substring(0, start) +
          text +
          currentContent.substring(end);

        onChangeContent(updated);
        pushHistory(updated);

        // Position cursor
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + text.length + cursorOffset;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          updateCursorInfo();
        }, 0);
      },
      [onChangeContent, pushHistory]
    );

    const formatCode = useCallback(() => {
      // Basic formatting helper: normalize 2 spaces and indentation
      const lines = file.content.split('\n');
      let indentLevel = 0;
      const formatted = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';

          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          const indent = ' '.repeat(indentLevel * settings.tabSize);
          const result = indent + trimmed;

          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
          }

          return result;
        })
        .join('\n');

      onChangeContent(formatted);
      pushHistory(formatted);
    }, [file.content, settings.tabSize, onChangeContent, pushHistory]);

    useImperativeHandle(
      ref,
      () => ({
        insertText: insertTextAtCursor,
        undo: handleUndo,
        redo: handleRedo,
        formatCode,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        focus: () => textareaRef.current?.focus(),
      }),
      [insertTextAtCursor, handleUndo, handleRedo, formatCode, historyIndex, history.length]
    );

    // Scroll synchronizer
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      const { scrollTop, scrollLeft } = e.currentTarget;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTop = scrollTop;
      }
    };

    // Calculate cursor line & column
    const updateCursorInfo = () => {
      const textarea = textareaRef.current;
      if (!textarea || !onCursorChange) return;

      const pos = textarea.selectionStart;
      const val = textarea.value.substring(0, pos);
      const lines = val.split('\n');
      const currentLine = lines.length;
      const currentCol = lines[lines.length - 1].length + 1;
      const selLen = textarea.selectionEnd - textarea.selectionStart;

      onCursorChange({
        line: currentLine,
        column: currentCol,
        selectionLength: selLen,
      });
    };

    // Handle keydown for Tab, Enter, Backspace, Brackets, and Shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Ctrl+Z (Undo) and Ctrl+Y (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Tab key
      if (e.key === 'Tab') {
        e.preventDefault();
        const spaces = ' '.repeat(settings.tabSize);
        insertTextAtCursor(spaces, 0);
        return;
      }

      // Enter key with Auto-indent
      if (e.key === 'Enter') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const currentContent = textarea.value;
        const beforeCursor = currentContent.substring(0, start);
        const afterCursor = currentContent.substring(start);
        const lastLine = beforeCursor.split('\n').pop() || '';

        // Match leading whitespace
        const match = lastLine.match(/^(\s*)/);
        let indent = match ? match[1] : '';

        // If line ends with opening bracket or colon, increase indent
        const trimmedLast = lastLine.trim();
        const opensBlock =
          trimmedLast.endsWith('{') ||
          trimmedLast.endsWith('(') ||
          trimmedLast.endsWith('[') ||
          trimmedLast.endsWith(':');

        if (opensBlock) {
          indent += ' '.repeat(settings.tabSize);
        }

        // Special case: cursor is between { and }
        const isBetweenBrackets =
          trimmedLast.endsWith('{') && afterCursor.trim().startsWith('}');

        if (isBetweenBrackets) {
          const innerIndent = indent;
          const outerIndent = match ? match[1] : '';
          const insertion = `\n${innerIndent}\n${outerIndent}`;
          const newContent =
            beforeCursor + insertion + afterCursor;

          onChangeContent(newContent);
          pushHistory(newContent);

          setTimeout(() => {
            const newCursor = start + 1 + innerIndent.length;
            textarea.setSelectionRange(newCursor, newCursor);
            updateCursorInfo();
          }, 0);
          return;
        }

        const newContent = beforeCursor + '\n' + indent + afterCursor;
        onChangeContent(newContent);
        pushHistory(newContent);

        setTimeout(() => {
          const newCursor = start + 1 + indent.length;
          textarea.setSelectionRange(newCursor, newCursor);
          updateCursorInfo();
        }, 0);
        return;
      }

      // Auto-closing brackets & quotes
      if (settings.autoCloseBrackets) {
        const pairs: Record<string, string> = {
          '(': ')',
          '[': ']',
          '{': '}',
          '"': '"',
          "'": "'",
          '`': '`',
        };

        if (pairs[e.key]) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentContent = textarea.value;

          // If text is selected, wrap it
          if (start !== end) {
            e.preventDefault();
            const selectedText = currentContent.substring(start, end);
            const wrapped = e.key + selectedText + pairs[e.key];
            const newContent =
              currentContent.substring(0, start) +
              wrapped +
              currentContent.substring(end);

            onChangeContent(newContent);
            pushHistory(newContent);

            setTimeout(() => {
              textarea.setSelectionRange(start + 1, end + 1);
              updateCursorInfo();
            }, 0);
            return;
          }

          // Otherwise insert pair
          e.preventDefault();
          insertTextAtCursor(e.key + pairs[e.key], -1);
          return;
        }

        // Backspace inside empty pair e.g. (|)
        if (e.key === 'Backspace') {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          if (start === end && start > 0) {
            const currentContent = textarea.value;
            const prevChar = currentContent[start - 1];
            const nextChar = currentContent[start];

            const isPair =
              (prevChar === '(' && nextChar === ')') ||
              (prevChar === '[' && nextChar === ']') ||
              (prevChar === '{' && nextChar === '}') ||
              (prevChar === '"' && nextChar === '"') ||
              (prevChar === "'" && nextChar === "'") ||
              (prevChar === '`' && nextChar === '`');

            if (isPair) {
              e.preventDefault();
              const newContent =
                currentContent.substring(0, start - 1) +
                currentContent.substring(start + 1);
              onChangeContent(newContent);
              pushHistory(newContent);

              setTimeout(() => {
                textarea.setSelectionRange(start - 1, start - 1);
                updateCursorInfo();
              }, 0);
              return;
            }
          }
        }
      }
    };

    // Find & Search logic
    const handleSearch = useCallback(() => {
      if (!searchQuery) {
        setSearchMatches([]);
        setCurrentMatchIndex(-1);
        return;
      }

      const content = file.content;
      const targetQuery = matchCase ? searchQuery : searchQuery.toLowerCase();
      const targetContent = matchCase ? content : content.toLowerCase();

      const matches: number[] = [];
      let idx = targetContent.indexOf(targetQuery);
      while (idx !== -1) {
        matches.push(idx);
        idx = targetContent.indexOf(targetQuery, idx + targetQuery.length);
      }

      setSearchMatches(matches);
      if (matches.length > 0) {
        setCurrentMatchIndex(0);
        highlightMatchInTextarea(matches[0], searchQuery.length);
      } else {
        setCurrentMatchIndex(-1);
      }
    }, [searchQuery, matchCase, file.content]);

    useEffect(() => {
      if (isSearchOpen && searchQuery) {
        handleSearch();
      }
    }, [searchQuery, matchCase, isSearchOpen]);

    const highlightMatchInTextarea = (start: number, length: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start, start + length);
      updateCursorInfo();
    };

    const handleNextMatch = () => {
      if (searchMatches.length === 0) return;
      const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
      setCurrentMatchIndex(nextIdx);
      highlightMatchInTextarea(searchMatches[nextIdx], searchQuery.length);
    };

    const handlePrevMatch = () => {
      if (searchMatches.length === 0) return;
      const prevIdx =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
      setCurrentMatchIndex(prevIdx);
      highlightMatchInTextarea(searchMatches[prevIdx], searchQuery.length);
    };

    const handleReplace = () => {
      if (currentMatchIndex === -1 || searchMatches.length === 0) return;
      const matchPos = searchMatches[currentMatchIndex];
      const newContent =
        file.content.substring(0, matchPos) +
        replaceQuery +
        file.content.substring(matchPos + searchQuery.length);

      onChangeContent(newContent);
      pushHistory(newContent);
    };

    const handleReplaceAll = () => {
      if (!searchQuery) return;
      const flags = matchCase ? 'g' : 'gi';
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, flags);
      const newContent = file.content.replace(regex, replaceQuery);

      onChangeContent(newContent);
      pushHistory(newContent);
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
    };

    // Line numbers calculation
    const lines = file.content.split('\n');
    const totalLines = Math.max(lines.length, 1);

    return (
      <div
        className="relative flex-1 flex flex-col h-full overflow-hidden select-text"
        style={{
          backgroundColor: theme.editorBg,
          color: theme.textColor,
        }}
      >
        {/* Find & Replace Overlay Bar */}
        {isSearchOpen && (
          <div
            className="flex flex-wrap items-center gap-2 p-2 border-b z-20 shadow-md text-xs"
            style={{
              backgroundColor: theme.appBarBg,
              borderColor: theme.borderColor,
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari teks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-black/25 border border-slate-700 rounded px-2 py-1 text-white focus:outline-hidden focus:border-sky-400 font-mono text-xs"
              />
              <button
                onClick={() => setMatchCase(!matchCase)}
                className={`p-1 rounded border transition-colors ${
                  matchCase
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-white'
                }`}
                title="Peka Huruf Besar/Kecil (Match Case)"
              >
                <CaseSensitive size={15} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <Replace size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Ganti dengan..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="w-full bg-black/25 border border-slate-700 rounded px-2 py-1 text-white focus:outline-hidden focus:border-sky-400 font-mono text-xs"
              />
              <button
                onClick={handleReplace}
                disabled={searchMatches.length === 0}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded font-medium text-[11px] whitespace-nowrap"
              >
                Ganti
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={searchMatches.length === 0}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded font-medium text-[11px] whitespace-nowrap"
              >
                Semua
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] text-slate-400 tabular-nums px-1">
                {searchMatches.length > 0
                  ? `${currentMatchIndex + 1}/${searchMatches.length}`
                  : searchQuery
                  ? '0 hasil'
                  : ''}
              </span>

              <button
                onClick={handlePrevMatch}
                disabled={searchMatches.length === 0}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-40 text-slate-400 hover:text-white"
                title="Hasil Sebelumnya"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={searchMatches.length === 0}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-40 text-slate-400 hover:text-white"
                title="Hasil Berikutnya"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={onCloseSearch}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white ml-1"
                title="Tutup Pencarian"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Editor Main Canvas */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Gutter / Line Numbers */}
          {settings.showLineNumbers && (
            <div
              ref={gutterRef}
              className="py-3 px-2 text-right select-none font-mono overflow-hidden shrink-0 border-r"
              style={{
                backgroundColor: theme.gutterBg,
                color: theme.gutterColor,
                borderColor: theme.borderColor,
                fontSize: `${settings.fontSize}px`,
                lineHeight: '1.6',
                minWidth: totalLines > 999 ? '52px' : totalLines > 99 ? '44px' : '36px',
              }}
            >
              {Array.from({ length: totalLines }, (_, i) => (
                <div key={i} className="leading-[1.6]">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Code Viewing & Editing Canvas */}
          <div className="relative flex-1 h-full overflow-hidden">
            {/* Syntax Highlighting Render Layer */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className={`absolute inset-0 m-0 py-3 px-3 pointer-events-none font-mono overflow-hidden ${
                settings.wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
              }`}
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: '1.6',
                tabSize: settings.tabSize,
              }}
              dangerouslySetInnerHTML={{
                __html: highlightCode(file.content, file.language, theme),
              }}
            />

            {/* Transparent Interactive Textarea Layer */}
            <textarea
              ref={textareaRef}
              value={file.content}
              onChange={(e) => {
                const val = e.target.value;
                onChangeContent(val);
                pushHistory(val);
                updateCursorInfo();
              }}
              onScroll={handleScroll}
              onClick={updateCursorInfo}
              onKeyUp={updateCursorInfo}
              onKeyDown={handleKeyDown}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className={`absolute inset-0 m-0 py-3 px-3 w-full h-full font-mono bg-transparent outline-hidden resize-none caret-sky-400 selection:bg-sky-500/30 ${
                settings.wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
              }`}
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: '1.6',
                tabSize: settings.tabSize,
                color: 'transparent', // Text rendered by pre layer with syntax colors
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);
CodeEditor.displayName = 'CodeEditor';
