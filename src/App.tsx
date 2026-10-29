import { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { TabBar } from './components/TabBar';
import { CodeEditor, CodeEditorHandle } from './components/CodeEditor';
import { QuickKeysBar } from './components/QuickKeysBar';
import { LivePreviewModal } from './components/LivePreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { TemplatesModal } from './components/TemplatesModal';
import { FileItem, EditorSettings, CursorPosition } from './types/editor';
import { THEMES } from './themes/editorThemes';
import { DEFAULT_FILES, detectLanguage } from './utils/starterFiles';
import { exportProjectZip } from './utils/projectZip';

const STORAGE_FILES_KEY = 'acode_files_v2';
const STORAGE_SETTINGS_KEY = 'acode_settings_v2';

export default function App() {
  // Load files from localStorage or defaults
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored files', e);
    }
    return DEFAULT_FILES;
  });

  // Settings
  const [settings, setSettings] = useState<EditorSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored settings', e);
    }
    return {
      theme: 'acode-dark',
      fontSize: 14,
      tabSize: 2,
      wordWrap: false,
      showLineNumbers: true,
      autoCloseBrackets: true,
      quickKeysVisible: true,
    };
  });

  // Active file
  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const firstOpen = DEFAULT_FILES.find((f) => f.isOpen && !f.isFolder);
    return firstOpen ? firstOpen.id : 'f1';
  });

  // Editor ref & Undo state
  const editorRef = useRef<CodeEditorHandle>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState<CursorPosition>({
    line: 1,
    column: 1,
    selectionLength: 0,
  });

  // Current active theme
  const currentTheme = useMemo(() => {
    return THEMES[settings.theme] || THEMES['acode-dark'];
  }, [settings.theme]);

  // Find active file
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || null;
  }, [files, activeFileId]);

  // Save files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save files to storage', e);
    }
  }, [files]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to storage', e);
    }
  }, [settings]);

  // Keyboard shortcut listeners (Ctrl+S, Ctrl+F, Ctrl+Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeFileId) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFileId ? { ...f, isUnsaved: false } : f
            )
          );
        }
        return;
      }

      // Ctrl+F / Cmd+F: Toggle Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Ctrl+Enter / Cmd+Enter: Run Live Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsPreviewOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeFileId]);

  // File operations
  const handleSelectFile = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isOpen: true } : f))
    );
    setActiveFileId(fileId);
    // On small screen, auto-close sidebar on select
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const remainingOpen = files.filter(
      (f) => f.isOpen && f.id !== fileId && !f.isFolder
    );

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isOpen: false } : f))
    );

    if (activeFileId === fileId) {
      setActiveFileId(remainingOpen.length > 0 ? remainingOpen[0].id : null);
    }
  };

  const handleCloseAllTabs = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, isOpen: false })));
    setActiveFileId(null);
  };

  const handleContentChange = (newContent: string) => {
    if (!activeFileId) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, content: newContent, isUnsaved: true }
          : f
      )
    );
  };

  const handleCreateFile = (
    name: string,
    isFolder: boolean,
    parentId?: string | null
  ) => {
    const newFile: FileItem = {
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      name,
      path: '/' + name,
      content: isFolder ? '' : `// Berkas baru: ${name}\n`,
      language: detectLanguage(name),
      isFolder,
      parentId: parentId || null,
      isOpen: !isFolder,
      isUnsaved: false,
    };

    setFiles((prev) => [...prev, newFile]);
    if (!isFolder) {
      setActiveFileId(newFile.id);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              name: newName,
              path: '/' + newName,
              language: detectLanguage(newName),
            }
          : f
      )
    );
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId && !f.isFolder);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleImportFiles = (imported: { name: string; content: string }[]) => {
    const newItems: FileItem[] = imported.map((item) => ({
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      name: item.name,
      path: '/' + item.name,
      content: item.content,
      language: detectLanguage(item.name),
      isFolder: false,
      parentId: null,
      isOpen: true,
      isUnsaved: false,
    }));

    setFiles((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      setActiveFileId(newItems[0].id);
    }
  };

  const handleExportZip = () => {
    exportProjectZip(files, 'notemy-project');
  };

  const handleResetProject = () => {
    setFiles(DEFAULT_FILES);
    setActiveFileId('f1');
  };

  const handleSelectTemplate = (templateFiles: FileItem[]) => {
    setFiles(templateFiles);
    const first = templateFiles.find((f) => f.isOpen && !f.isFolder);
    setActiveFileId(first ? first.id : templateFiles[0]?.id || null);
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textColor,
      }}
    >
      {/* 1. Header (Top Bar Contract) */}
      <Header
        theme={currentTheme}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onRunPreview={() => setIsPreviewOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onExportZip={handleExportZip}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        activeFileName={activeFile?.name}
        isUnsaved={activeFile?.isUnsaved}
      />

      {/* 2. Workspace Center (Sidebar + Main Editor) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Explorer Sidebar */}
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          theme={currentTheme}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onImportFiles={handleImportFiles}
        />

        {/* Main Editor Canvas Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Tab Bar for open files */}
          <TabBar
            files={files}
            activeFileId={activeFileId}
            theme={currentTheme}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
            onCloseAll={handleCloseAllTabs}
          />

          {/* Active File Editor */}
          {activeFile ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <CodeEditor
                key={activeFile.id}
                ref={editorRef}
                file={activeFile}
                theme={currentTheme}
                settings={settings}
                isSearchOpen={isSearchOpen}
                onCloseSearch={() => setIsSearchOpen(false)}
                onChangeContent={handleContentChange}
                onCursorChange={setCursorPos}
                onUndoStateChange={(u, r) => {
                  setCanUndo(u);
                  setCanRedo(r);
                }}
              />
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500"
              style={{ backgroundColor: currentTheme.editorBg }}
            >
              <div className="max-w-md space-y-3">
                <h3 className="text-base font-semibold text-slate-300">
                  Tidak Ada Berkas Aktif
                </h3>
                <p className="text-xs text-slate-400">
                  Buka berkas dari penjelajah di panel kiri, atau gunakan tombol di bawah untuk membuat berkas baru.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
                  >
                    Buka Penjelajah Berkas
                  </button>
                  <button
                    onClick={() => handleCreateFile('main.js', false)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
                  >
                    + Buat main.js
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Quick-Keys Toolbar (Acode Mobile Signature) */}
          {settings.quickKeysVisible && activeFile && (
            <QuickKeysBar
              theme={currentTheme}
              onInsertText={(text, offset) => {
                editorRef.current?.insertText(text, offset);
              }}
              onUndo={() => editorRef.current?.undo()}
              onRedo={() => editorRef.current?.redo()}
              onFormat={() => editorRef.current?.formatCode()}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}

          {/* Bottom Status Bar */}
          <footer
            className="flex items-center justify-between px-3 h-6 border-t text-[11px] font-mono select-none shrink-0"
            style={{
              backgroundColor: currentTheme.appBarBg,
              borderColor: currentTheme.borderColor,
              color: currentTheme.gutterColor,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                Ln {cursorPos.line}, Kol {cursorPos.column}
              </span>
              {cursorPos.selectionLength > 0 && (
                <span className="hidden sm:inline tabular-nums">
                  ({cursorPos.selectionLength} dipilih)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">UTF-8</span>
              <span className="uppercase text-sky-400 font-semibold">
                {activeFile?.language || 'TEXT'}
              </span>
              <span>Spasi: {settings.tabSize}</span>
            </div>
          </footer>
        </div>
      </div>

      {/* 3. Modals */}
      {/* Live Preview & Developer Console Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        files={files}
        theme={currentTheme}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        theme={currentTheme}
        onUpdateSettings={(newVals) =>
          setSettings((prev) => ({ ...prev, ...newVals }))
        }
        onResetProject={handleResetProject}
      />

      {/* Project Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        theme={currentTheme}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
