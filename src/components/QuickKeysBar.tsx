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
    { label: 'Tab', insert: '  ', title: 'Inden 2 ruang' },
    { label: '{', insert: '{}', offset: -1, title: 'Kurungan dakap' },
    { label: '}', insert: '}', title: 'Tutup kurungan dakap' },
    { label: '(', insert: '()', offset: -1, title: 'Tanda kurung' },
    { label: ')', insert: ')', title: 'Tutup tanda kurung' },
    { label: '<', insert: '<>', offset: -1, title: 'Kurungan sudut / Tag HTML' },
    { label: '>', insert: '>', title: 'Tutup tag' },
    { label: '[', insert: '[]', offset: -1, title: 'Kurungan siku' },
    { label: ']', insert: ']', title: 'Tutup kurungan siku' },
    { label: '"', insert: '""', offset: -1, title: 'Tanda petik berganda' },
    { label: "'", insert: "''", offset: -1, title: 'Tanda petik tunggal' },
    { label: ';', insert: ';', title: 'Koma bertitik' },
    { label: ':', insert: ':', title: 'Bertindih' },
    { label: '=', insert: ' = ', title: 'Tanda sama dengan' },
    { label: '=>', insert: ' => ', title: 'Fungsi anak panah' },
    { label: '/', insert: '/', title: 'Garis condong' },
    { label: '\\', insert: '\\', title: 'Garis condong terbalik' },
    { label: '!', insert: '!', title: 'Tanda seru' },
    { label: '$', insert: '$', title: 'Dolar' },
    { label: '_', insert: '_', title: 'Garis bawah' },
    { label: '&', insert: '&', title: 'Ampersand (dan)' },
    { label: '|', insert: '|', title: 'Garis tegak (paip)' },
    { label: '+', insert: ' + ', title: 'Tambah' },
    { label: '-', insert: ' - ', title: 'Tolak' },
    { label: '?', insert: '?', title: 'Tanda soal' },
    { label: '#', insert: '#', title: 'Tanda pagar' },
  ];

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5 border-t overflow-x-auto no-scrollbar select-none shrink-0 shadow-inner z-20"
      style={{
        backgroundColor: theme.quickKeyBg,
        borderColor: theme.borderColor,
      }}
      onMouseDown={(e) => {
        // Elak hilang fokus pada ruang teks (textarea)
        e.preventDefault();
      }}
    >
      {/* Kawalan Buat Asal / Buat Semula (Undo / Redo) */}
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
          title="Buat Asal (Undo)"
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
          title="Buat Semula (Redo)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Kunci Pintas Simbol */}
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
            title="Kemaskan Kod (Format Inden Automatik)"
          >
            <Sparkles size={13} />
            <span>Format</span>
          </button>
        )}
      </div>
    </div>
  );
};
