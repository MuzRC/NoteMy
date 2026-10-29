import React from 'react';
import {
  Play,
  Settings,
  FolderTree,
  Download,
  LayoutTemplate,
  Search,
} from 'lucide-react';
import { EditorTheme } from '../types/editor';

interface HeaderProps {
  theme: EditorTheme;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRunPreview: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onExportZip: () => void;
  onToggleSearch: () => void;
  activeFileName?: string;
  isUnsaved?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  isSidebarOpen,
  onToggleSidebar,
  onRunPreview,
  onOpenSettings,
  onOpenTemplates,
  onExportZip,
  onToggleSearch,
  activeFileName,
  isUnsaved,
}) => {
  return (
    <header
      className="flex items-center justify-between gap-4 px-3 sm:px-5 h-13 border-b select-none shrink-0 transition-colors"
      style={{
        backgroundColor: theme.appBarBg,
        borderColor: theme.borderColor,
      }}
    >
      {/* Zone 1: Wordmark & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: isSidebarOpen ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: isSidebarOpen ? theme.accentColor : theme.tabText,
          }}
          title={isSidebarOpen ? 'Tutup Berkas' : 'Buka Berkas'}
          aria-label="Toggle Berkas"
        >
          <FolderTree size={19} />
        </button>

        <span
          className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap"
          style={{ color: theme.textColor }}
        >
          NoteMy
        </span>

        {activeFileName && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-white/10">
            <span className="truncate max-w-[150px]">{activeFileName}</span>
            {isUnsaved && (
              <span className="text-amber-400 font-bold" title="Belum disimpan">
                •
              </span>
            )}
          </div>
        )}
      </div>

      {/* Zone 2: Navigation & Tool Controls */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleSearch}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-90 active:scale-95"
          style={{ color: theme.tabText }}
          title="Cari & Ganti Teks (Ctrl+F)"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Cari</span>
        </button>

        <button
          onClick={onOpenTemplates}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-90 active:scale-95"
          style={{ color: theme.tabText }}
          title="Pilih Template Proyek"
        >
          <LayoutTemplate size={16} />
          <span className="hidden sm:inline">Template</span>
        </button>

        <button
          onClick={onExportZip}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-90 active:scale-95"
          style={{ color: theme.tabText }}
          title="Ekspor Proyek ke ZIP"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Ekspor ZIP</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-90 active:scale-95"
          style={{ color: theme.tabText }}
          title="Pengaturan Editor & Tema"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Setelan</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action (Run Preview) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRunPreview}
          className="h-8.5 px-3.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all duration-150 hover:brightness-110 active:scale-95"
          style={{
            backgroundColor: '#10B981',
            color: '#FFFFFF',
          }}
          title="Jalankan Web Preview & Console"
        >
          <Play size={14} className="fill-current" />
          <span>Run</span>
        </button>
      </div>
    </header>
  );
};
