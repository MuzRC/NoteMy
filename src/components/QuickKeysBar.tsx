import React from 'react';
import { Undo2, Redo2, CornerDownLeft, Sparkles } from 'lucide-react';
import { EditorTheme } from '../types/editor';

interface QuickKeysBarProps {
  theme: EditorTheme;
  onInsertText: (text: string, cursorOffset?: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFormat?: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const QuickKeysBar: React.FC<QuickKeysBarProps> = ({
  theme,
  onInsertText,
  onUndo,
  onRedo,
  onFormat,
  canUndo,
  canRedo,
}) => {
  const quickKeys = [
    { label: 'Tab', insert: '  ', title: 'Indent 2 spaces' },
    { label: '{', insert: '{}', offset: -1, title: 'Braces' },
    { label: '}', insert: '}', title: 'Closing brace' },
    { label: '(', insert: '()', offset: -1, title: 'Parentheses' },
    { label: ')', insert: ')', title: 'Closing parenthesis' },
    { label: '<', insert: '<>', offset: -1, title: 'Angle brackets / HTML tag' },
    { label: '>', insert: '>', title: 'Closing tag' },
    { label: '[', insert: '[]', offset: -1, title: 'Square brackets' },
    { label: ']', insert: ']', title: 'Closing bracket' },
    { label: '"', insert: '""', offset: -1, title: 'Double quotes' },
    { label: "'", insert: "''", offset: -1, title: 'Single quotes' },
    { label: ';', insert: ';', title: 'Semicolon' },
    { label: ':', insert: ':', title: 'Colon' },
    { label: '=', insert: ' = ', title: 'Equal sign' },
    { label: '=>', insert: ' => ', title: 'Arrow function' },
    { label: '/', insert: '/', title: 'Slash' },
    { label: '\\', insert: '\\', title: 'Backslash' },
    { label: '!', insert: '!', title: 'Exclamation' },
    { label: '$', insert: '$', title: 'Dollar' },
    { label: '_', insert: '_', title: 'Underscore' },
    { label: '&', insert: '&', title: 'Ampersand' },
    { label: '|', insert: '|', title: 'Pipe' },
    { label: '+', insert: ' + ', title: 'Plus' },
    { label: '-', insert: ' - ', title: 'Minus' },
    { label: '?', insert: '?', title: 'Question mark' },
    { label: '#', insert: '#', title: 'Hash' },
  ];

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5 border-t overflow-x-auto no-scrollbar select-none shrink-0 shadow-inner z-20"
      style={{
        backgroundColor: theme.quickKeyBg,
        borderColor: theme.borderColor,
      }}
      onMouseDown={(e) => {
        // Prevent loss of focus in textarea
        e.preventDefault();
      }}
    >
      {/* Undo / Redo controls */}
      <div className="flex items-center gap-1 pr-1 border-r border-white/10 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`h-8 px-2.5 rounded text-xs flex items-center justify-center font-medium transition-all active:scale-90 ${
            canUndo
              ? 'hover:bg-white/15 cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: theme.quickKeyText,
          }}
          title="Undo (Urungkan)"
        >
          <Undo2 size={14} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`h-8 px-2.5 rounded text-xs flex items-center justify-center font-medium transition-all active:scale-90 ${
            canRedo
              ? 'hover:bg-white/15 cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: theme.quickKeyText,
          }}
          title="Redo (Ulangi)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Symbol quick keys */}
      <div className="flex items-center gap-1.5 shrink-0">
        {quickKeys.map((key, idx) => (
          <button
            key={idx}
            onClick={() => onInsertText(key.insert, key.offset || 0)}
            className="h-8 min-w-[34px] px-2 rounded font-mono text-xs font-semibold flex items-center justify-center border transition-all active:scale-90 hover:brightness-125"
            style={{
              backgroundColor: theme.quickKeyBg,
              color: theme.quickKeyText,
              borderColor: theme.quickKeyBorder,
            }}
            title={key.title}
          >
            {key.label}
          </button>
        ))}

        {onFormat && (
          <button
            onClick={onFormat}
            className="h-8 px-2.5 rounded font-mono text-xs font-semibold flex items-center gap-1 border transition-all active:scale-90 hover:brightness-125"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: theme.accentColor,
              borderColor: theme.quickKeyBorder,
            }}
            title="Rapikan Kode (Auto-format Indentasi)"
          >
            <Sparkles size={13} />
            <span>Format</span>
          </button>
        )}
      </div>
    </div>
  );
};
