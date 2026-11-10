import React from 'react';
import { X, LayoutTemplate, Sparkles, Gamepad2, Globe, FileText } from 'lucide-react';
import { EditorTheme, FileItem } from '../types/editor';
import { TEMPLATES, ProjectTemplate } from '../utils/starterFiles';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: EditorTheme;
  onSelectTemplate: (files: FileItem[]) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'canvas-game':
        return <Gamepad2 size={20} className="text-emerald-400" />;
      case 'web-starter':
        return <Globe size={20} className="text-sky-400" />;
      default:
        return <FileText size={20} className="text-purple-400" />;
    }
  };

  const handleApply = (tpl: ProjectTemplate) => {
    if (
      confirm(
        `Gantikan projek semasa dengan templat "${tpl.name}"? Fail lama anda akan digantikan.`
      )
    ) {
      onSelectTemplate(tpl.files);
      onClose();
    }
  };

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
            <LayoutTemplate size={18} className="text-sky-400" />
            <h2 className="font-semibold text-sm sm:text-base">Pilih Templat Projek</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Badan Modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Pilih salah satu templat sedia guna di bawah untuk mencuba pratonton langsung dan fungsi NoteMy.
          </p>

          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleApply(tpl)}
              className="group p-4 rounded-xl border border-white/10 hover:border-sky-400/50 bg-black/20 hover:bg-black/35 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:scale-105 transition-transform">
                    {getTemplateIcon(tpl.id)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-400">{tpl.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  {tpl.badge || tpl.category || 'Templat'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pt-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>
                  {tpl.files.length} Fail:{' '}
                  {tpl.files.map((f) => f.name).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Kaki Modal */}
        <div
          className="flex justify-end p-4 border-t select-none"
          style={{ borderColor: theme.borderColor }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
