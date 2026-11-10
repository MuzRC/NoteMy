import React, { memo } from 'react';
import {
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
} from 'lucide-react';
import { EditorTheme } from '../types/editor';

interface EditorSearchBarProps {
  theme: EditorTheme;
  isOpen: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  replaceQuery: string;
  setReplaceQuery: (val: string) => void;
  matchCase: boolean;
  setMatchCase: (val: boolean) => void;
  searchMatches: number[];
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const EditorSearchBar: React.FC<EditorSearchBarProps> = memo(({
  theme,
  isOpen,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  matchCase,
  setMatchCase,
  searchMatches,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  onReplace,
  onReplaceAll,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-2 border-b z-20 shadow-md text-xs shrink-0 select-none"
      style={{
        backgroundColor: theme.appBarBg,
        borderColor: theme.borderColor,
      }}
    >
      {/* Medan Input Carian */}
      <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
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
          type="button"
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

      {/* Medan Input Ganti */}
      <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
        <Replace size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Ganti dengan..."
          value={replaceQuery}
          onChange={(e) => setReplaceQuery(e.target.value)}
          className="w-full bg-black/25 border border-slate-700 rounded px-2 py-1 text-white focus:outline-hidden focus:border-sky-400 font-mono text-xs"
        />
        <button
          type="button"
          onClick={onReplace}
          disabled={searchMatches.length === 0}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded font-medium text-[11px] whitespace-nowrap"
        >
          Ganti
        </button>
        <button
          type="button"
          onClick={onReplaceAll}
          disabled={searchMatches.length === 0}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded font-medium text-[11px] whitespace-nowrap"
        >
          Semua
        </button>
      </div>

      {/* Navigasi Padanan & Butang Tutup */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] text-slate-400 tabular-nums px-1">
          {searchMatches.length > 0
            ? `${currentMatchIndex + 1}/${searchMatches.length}`
            : searchQuery
            ? '0 padanan'
            : ''}
        </span>

        <button
          type="button"
          onClick={onPrevMatch}
          disabled={searchMatches.length === 0}
          className="p-1 hover:bg-white/10 rounded disabled:opacity-40 text-slate-400 hover:text-white"
          title="Padanan Terdahulu"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={onNextMatch}
          disabled={searchMatches.length === 0}
          className="p-1 hover:bg-white/10 rounded disabled:opacity-40 text-slate-400 hover:text-white"
          title="Padanan Seterusnya"
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white ml-1"
          title="Tutup Carian"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
});

EditorSearchBar.displayName = 'EditorSearchBar';
