import React from 'react';
import { X, FileCode } from 'lucide-react';
import { FileItem, EditorTheme } from '../types/editor';

interface TabBarProps {
  files: FileItem[];
  activeFileId: string | null;
  theme: EditorTheme;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseAll: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  files,
  activeFileId,
  theme,
  onSelectTab,
  onCloseTab,
  onCloseAll,
}) => {
  const openFiles = files.filter((f) => f.isOpen && !f.isFolder);

  if (openFiles.length === 0) {
    return (
      <div
        className="flex items-center px-4 h-10 border-b text-xs text-slate-500 italic select-none"
        style={{
          backgroundColor: theme.tabBg,
          borderColor: theme.borderColor,
        }}
      >
        Tidak ada berkas terbuka. Pilih berkas dari panel samping.
      </div>
    );
  }

  return (
    <div
      className="flex items-center h-10 border-b overflow-x-auto no-scrollbar select-none shrink-0"
      style={{
        backgroundColor: theme.tabBg,
        borderColor: theme.borderColor,
      }}
    >
      <div className="flex items-stretch h-full">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              className="group relative flex items-center gap-2 px-3.5 h-full cursor-pointer text-xs font-mono transition-colors border-r"
              style={{
                backgroundColor: isActive ? theme.activeTabBg : theme.tabBg,
                color: isActive ? theme.activeTabText : theme.tabText,
                borderColor: theme.borderColor,
                borderTop: isActive ? `2px solid ${theme.accentColor}` : '2px solid transparent',
              }}
              title={file.path}
            >
              <FileCode size={13} className="shrink-0 opacity-80" />
              <span className="truncate max-w-[130px]">{file.name}</span>

              {file.isUnsaved && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:hidden"
                  style={{ backgroundColor: theme.accentColor }}
                />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className={`p-0.5 rounded hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity ${
                  file.isUnsaved ? 'hidden group-hover:block' : ''
                }`}
                title="Tutup Tab"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {openFiles.length > 2 && (
        <button
          onClick={onCloseAll}
          className="ml-auto px-3 text-[11px] text-slate-500 hover:text-slate-300 whitespace-nowrap"
          title="Tutup Semua Tab"
        >
          Tutup Semua
        </button>
      )}
    </div>
  );
};
