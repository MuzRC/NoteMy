import React from 'react';
import { X, Palette, Type, Sliders, RotateCcw } from 'lucide-react';
import { EditorSettings, EditorTheme, ThemeId } from '../types/editor';
import { THEMES } from '../themes/editorThemes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  theme: EditorTheme;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onResetProject: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  theme,
  onUpdateSettings,
  onResetProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all max-h-[90vh]"
        style={{
          backgroundColor: theme.appBarBg,
          borderColor: theme.borderColor,
          color: theme.textColor,
        }}
      >
        {/* Header Modal */}
        <div
          className="flex items-center justify-between px-5 h-13 border-b select-none shrink-0"
          style={{ borderColor: theme.borderColor }}
        >
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-sky-400" />
            <h2 className="font-semibold text-sm sm:text-base">Tetapan Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Badan Modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
          {/* Bahagian 1: Tema */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <Palette size={14} className="text-sky-400" />
              <span>Tema Visual Editor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const t = THEMES[themeKey];
                const isSelected = settings.theme === themeKey;

                return (
                  <button
                    key={themeKey}
                    onClick={() => onUpdateSettings({ theme: themeKey })}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-400 ring-2 ring-sky-400/20 shadow-md scale-[1.02]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ backgroundColor: t.appBarBg }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: t.keyword }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: t.string }}
                      />
                    </div>
                    <span
                      className="font-medium text-xs truncate"
                      style={{ color: t.textColor }}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bahagian 2: Tipografi & Saiz */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <Type size={14} className="text-sky-400" />
              <span>Saiz Fon & Lekukan (Inden)</span>
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
              {/* Saiz fon */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-slate-300">Saiz Fon Editor</label>
                  <span className="font-mono text-xs text-sky-400 font-bold tabular-nums">
                    {settings.fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="22"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) =>
                    onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Saiz Tab */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-slate-300">Lebar Tab (Ruang)</span>
                <div className="flex gap-1.5">
                  {[2, 4].map((size) => (
                    <button
                      key={size}
                      onClick={() => onUpdateSettings({ tabSize: size })}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                        settings.tabSize === size
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {size} Ruang
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bahagian 3: Pilihan Editor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <Sliders size={14} className="text-sky-400" />
              <span>Pilihan Penulisan Kod</span>
            </div>

            <div className="divide-y divide-white/5 p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
              {/* Balut baris */}
              <label className="flex items-center justify-between cursor-pointer pt-1">
                <span className="text-xs text-slate-300">Balut Teks (Word Wrap Baris Panjang)</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </label>

              {/* Nombor baris */}
              <label className="flex items-center justify-between cursor-pointer pt-3">
                <span className="text-xs text-slate-300">Papar Nombor Baris</span>
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) =>
                    onUpdateSettings({ showLineNumbers: e.target.checked })
                  }
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </label>

              {/* Tutup kurungan automatik */}
              <label className="flex items-center justify-between cursor-pointer pt-3">
                <span className="text-xs text-slate-300">
                  Tutup Kurungan & Tanda Petik Automatik
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoCloseBrackets}
                  onChange={(e) =>
                    onUpdateSettings({ autoCloseBrackets: e.target.checked })
                  }
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Bahagian 4: Tetapan Semula (Zon Bahaya) */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Adakah anda pasti mahu menetapkan semula semua fail ke contoh lalai? Segala perubahan yang belum disimpan akan hilang.'
                  )
                ) {
                  onResetProject();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Tetapkan Semula Projek ke Fail Asal</span>
            </button>
          </div>
        </div>

        {/* Bawah Modal */}
        <div
          className="flex justify-end p-4 border-t select-none"
          style={{ borderColor: theme.borderColor }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
