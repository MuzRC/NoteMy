import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { TabBar } from './components/TabBar';
import { CodeEditor, CodeEditorHandle } from './components/CodeEditor';
import { QuickKeysBar } from './components/QuickKeysBar';
import { LivePreviewModal } from './components/LivePreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { TemplatesModal } from './components/TemplatesModal';
import { FileItem, EditorSettings, CursorPosition, EditorTheme } from './types/editor';
import { THEMES } from './themes/editorThemes';
import { DEFAULT_FILES, detectLanguage } from './utils/starterFiles';
import { exportProjectZip } from './utils/projectZip';

const STORAGE_FILES_KEY = 'acode_files_v2';
const STORAGE_SETTINGS_KEY = 'acode_settings_v2';

// 1. Komponen Bar Status Terasing (Bahasa Melayu & Ringan untuk Telefon)
interface StatusBarProps {
  theme: EditorTheme;
  language?: string;
  tabSize: number;
}

const StatusBar = memo(({ theme, language, tabSize }: StatusBarProps) => {
  const [cursorPos, setCursorPos] = useState<CursorPosition>({
    line: 1,
    column: 1,
    selectionLength: 0,
  });

  useEffect(() => {
    const handleCursorUpdate = (e: CustomEvent<CursorPosition>) => {
      if (e.detail) {
        setCursorPos(e.detail);
      }
    };

    window.addEventListener('notemy-cursor-change' as any, handleCursorUpdate);
    return () => {
      window.removeEventListener('notemy-cursor-change' as any, handleCursorUpdate);
    };
  }, []);

  return (
    <footer
      className="flex items-center justify-between px-3 h-6 border-t text-[11px] font-mono select-none shrink-0"
      style={{
        backgroundColor: theme.appBarBg,
        borderColor: theme.borderColor,
        color: theme.gutterColor,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          Ln {cursorPos.line}, Lajur {cursorPos.column}
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
          {language || 'TEKS'}
        </span>
        <span>Jarak: {tabSize}</span>
      </div>
    </footer>
  );
});

StatusBar.displayName = 'StatusBar';

export default function App() {
  // Muat fail dari localStorage atau guna nilai lalai
  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal memuat fail tersimpan', e);
    }
    return DEFAULT_FILES;
  });

  // Tetapan Aplikasi
  const [settings, setSettings] = useState<EditorSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Gagal memuat tetapan tersimpan', e);
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

  // Fail aktif semasa
  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const firstOpen = DEFAULT_FILES.find((f) => f.isOpen && !f.isFolder);
    return firstOpen ? firstOpen.id : 'f1';
  });

  // Editor ref & status Undo/Redo
  const editorRef = useRef<CodeEditorHandle>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Status Antara Muka (UI)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Tema aktif semasa
  const currentTheme = useMemo(() => {
    return THEMES[settings.theme] || THEMES['acode-dark'];
  }, [settings.theme]);

  // Cari fail yang sedang aktif
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || null;
  }, [files, activeFileId]);

  // Simpan fail ke localStorage dengan Debounce 800ms (elak papan kekunci telefon lag)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(files));
      } catch (e) {
        console.error('Gagal menyimpan fail ke storan', e);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [files]);

  // Simpan tetapan ke localStorage dengan Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Gagal menyimpan tetapan ke storan', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [settings]);

  // Hantar posisi kursor terus ke Bar Status tanpa re-render skrin utama
  const handleCursorChange = useCallback((pos: CursorPosition) => {
    window.dispatchEvent(
      new CustomEvent('notemy-cursor-change', { detail: pos })
    );
  }, []);

  const handleUndoStateChange = useCallback((u: boolean, r: boolean) => {
    setCanUndo(u);
    setCanRedo(r);
  }, []);

  // Pintasan Papan Kekunci (Ctrl+S, Ctrl+F, Ctrl+Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Simpan fail
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

      // Ctrl+F / Cmd+F: Buka/Tutup Carian
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Ctrl+Enter / Cmd+Enter: Jalankan Pratonton Langsung
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsPreviewOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeFileId]);

  // Operasi Fail
  const handleSelectFile = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isOpen: true } : f))
    );
    setActiveFileId(fileId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleCloseTab = useCallback((fileId: string) => {
    setFiles((prev) => {
      const remainingOpen = prev.filter(
        (f) => f.isOpen && f.id !== fileId && !f.isFolder
      );
      setActiveFileId((currentActive) => {
        if (currentActive === fileId) {
          return remainingOpen.length > 0 ? remainingOpen[0].id : null;
        }
        return currentActive;
      });
      return prev.map((f) => (f.id === fileId ? { ...f, isOpen: false } : f));
    });
  }, []);

  const handleCloseAllTabs = useCallback(() => {
    setFiles((prev) => prev.map((f) => ({ ...f, isOpen: false })));
    setActiveFileId(null);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    if (!activeFileId) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, content: newContent, isUnsaved: true }
          : f
      )
    );
  }, [activeFileId]);

  const handleCreateFile = useCallback(
    (name: string, isFolder: boolean, parentId?: string | null) => {
      const newFile: FileItem = {
        id: 'f_' + Math.random().toString(36).substring(2, 9),
        name,
        path: '/' + name,
        content: isFolder ? '' : `// Fail baru: ${name}\n`,
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
    },
    []
  );

  const handleRenameFile = useCallback((fileId: string, newName: string) => {
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
  }, []);

  const handleDeleteFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      setActiveFileId((currentId) => {
        if (currentId === fileId) {
          const remaining = updated.filter((f) => f.isOpen && !f.isFolder);
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return currentId;
      });
      return updated;
    });
  }, []);

  const handleImportFiles = useCallback(
    (imported: { name: string; content: string }[]) => {
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
    },
    []
  );

  const handleExportZip = useCallback(() => {
    exportProjectZip(files, 'notemy-project');
  }, [files]);

  const handleResetProject = useCallback(() => {
    setFiles(DEFAULT_FILES);
    setActiveFileId('f1');
  }, []);

  const handleSelectTemplate = useCallback((templateFiles: FileItem[]) => {
    setFiles(templateFiles);
    const first = templateFiles.find((f) => f.isOpen && !f.isFolder);
    setActiveFileId(first ? first.id : templateFiles[0]?.id || null);
  }, []);

  // Togol Antara Muka (UI)
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const handleOpenPreview = useCallback(() => setIsPreviewOpen(true), []);
  const handleClosePreview = useCallback(() => setIsPreviewOpen(false), []);
  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleOpenTemplates = useCallback(() => setIsTemplatesOpen(true), []);
  const handleCloseTemplates = useCallback(() => setIsTemplatesOpen(false), []);
  const handleToggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);

  const handleUpdateSettings = useCallback((newVals: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newVals }));
  }, []);

  // Tindakan QuickKeysBar
  const handleInsertText = useCallback((text: string, offset?: number) => {
    editorRef.current?.insertText(text, offset);
  }, []);

  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current?.redo();
  }, []);

  const handleFormatCode = useCallback(() => {
    editorRef.current?.formatCode();
  }, []);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textColor,
      }}
    >
      {/* 1. Header (Menu Atas) */}
      <Header
        theme={currentTheme}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onRunPreview={handleOpenPreview}
        onOpenSettings={handleOpenSettings}
        onOpenTemplates={handleOpenTemplates}
        onExportZip={handleExportZip}
        onToggleSearch={handleToggleSearch}
        activeFileName={activeFile?.name}
        isUnsaved={activeFile?.isUnsaved}
      />

      {/* 2. Ruang Kerja Utama (Sidebar + Penyunting Kod) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Penjelajah Fail (Sidebar) */}
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          theme={currentTheme}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onImportFiles={handleImportFiles}
        />

        {/* Bekas Penyunting Kod */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Bar Tab Fail Terbuka */}
          <TabBar
            files={files}
            activeFileId={activeFileId}
            theme={currentTheme}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
            onCloseAll={handleCloseAllTabs}
          />

          {/* Editor Fail Aktif */}
          {activeFile ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <CodeEditor
                key={activeFile.id}
                ref={editorRef}
                file={activeFile}
                theme={currentTheme}
                settings={settings}
                isSearchOpen={isSearchOpen}
                onCloseSearch={handleCloseSearch}
                onChangeContent={handleContentChange}
                onCursorChange={handleCursorChange}
                onUndoStateChange={handleUndoStateChange}
              />
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500"
              style={{ backgroundColor: currentTheme.editorBg }}
            >
              <div className="max-w-md space-y-3">
                <h3 className="text-base font-semibold text-slate-300">
                  Tiada Fail Aktif
                </h3>
                <p className="text-xs text-slate-400">
                  Buka fail daripada penjelajah di panel kiri, atau gunakan butang di bawah untuk cipta fail baru.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={handleToggleSidebar}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
                  >
                    Buka Penjelajah Fail
                  </button>
                  <button
                    onClick={() => handleCreateFile('main.js', false)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
                  >
                    + Cipta main.js
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bar Kunci Pantas (Quick-Keys Toolbar) */}
          {settings.quickKeysVisible && activeFile && (
            <QuickKeysBar
              theme={currentTheme}
              onInsertText={handleInsertText}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFormat={handleFormatCode}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}

          {/* Bar Status Bawah - Bahasa Melayu & Ringan */}
          <StatusBar
            theme={currentTheme}
            language={activeFile?.language}
            tabSize={settings.tabSize}
          />
        </div>
      </div>

      {/* 3. Modal & Dialog */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        files={files}
        theme={currentTheme}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        settings={settings}
        theme={currentTheme}
        onUpdateSettings={handleUpdateSettings}
        onResetProject={handleResetProject}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={handleCloseTemplates}
        theme={currentTheme}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
