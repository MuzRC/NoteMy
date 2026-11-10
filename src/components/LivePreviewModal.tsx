import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  X,
  RotateCw,
  Smartphone,
  Tablet,
  Maximize2,
  Terminal,
  Globe,
  Trash2,
  ExternalLink,
  Send,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { FileItem, EditorTheme, ConsoleMessage, ConsoleLevel } from '../types/editor';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  theme: EditorTheme;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = memo(({
  isOpen,
  onClose,
  files,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile' | 'tablet'>('responsive');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [consoleFilter, setConsoleFilter] = useState<'all' | ConsoleLevel>('all');
  const [replInput, setReplInput] = useState('');
  const [keyCounter, setKeyCounter] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Jana bungkusan HTML gabungan hanya apabila modal dibuka
  const htmlContent = useMemo(() => {
    if (!isOpen) return '';

    const htmlFile =
      files.find((f) => f.name.toLowerCase() === 'index.html' && !f.isFolder) ||
      files.find((f) => f.language === 'html' && !f.isFolder);

    if (!htmlFile) {
      return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;color:#94a3b8;text-align:center;">
        <h3>Tiada fail HTML ditemui</h3>
        <p>Sila cipta fail <code>index.html</code> untuk menjalankan pratonton web.</p>
      </body></html>`;
    }

    let doc = htmlFile.content;

    // Skrip penghubung untuk menangkap mesej konsol & ralat
    const bridgeScript = `
    <script>
      (function() {
        function send(type, args) {
          try {
            window.parent.postMessage({
              source: 'acode-preview-console',
              type: type,
              args: args.map(function(a) {
                if (typeof a === 'object' && a !== null) {
                  try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
                }
                return String(a);
              }),
              timestamp: new Date().toLocaleTimeString()
            }, '*');
          } catch(e) {}
        }

        const origLog = console.log;
        const origInfo = console.info;
        const origWarn = console.warn;
        const origError = console.error;

        console.log = function() {
          origLog.apply(console, arguments);
          send('log', Array.from(arguments));
        };
        console.info = function() {
          origInfo.apply(console, arguments);
          send('info', Array.from(arguments));
        };
        console.warn = function() {
          origWarn.apply(console, arguments);
          send('warn', Array.from(arguments));
        };
        console.error = function() {
          origError.apply(console, arguments);
          send('error', Array.from(arguments));
        };

        window.onerror = function(msg, url, line, col, err) {
          send('error', [msg + (line ? ' [Baris ' + line + ']' : '')]);
        };

        window.addEventListener('unhandledrejection', function(e) {
          send('error', ['Promise Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown')]);
        });

        // Penerima mesej REPL
        window.addEventListener('message', function(ev) {
          if (ev.data && ev.data.source === 'acode-repl-eval') {
            try {
              const res = eval(ev.data.code);
              send('log', ['=> ' + (typeof res === 'object' ? JSON.stringify(res, null, 2) : res)]);
            } catch(err) {
              send('error', ['Eval Error: ' + err.message]);
            }
          }
        });
      })();
    </script>
    `;

    // Sisip skrip penghubung selepas <head> atau di awal fail
    if (doc.includes('<head>')) {
      doc = doc.replace('<head>', `<head>${bridgeScript}`);
    } else {
      doc = bridgeScript + doc;
    }

    // Selit fail CSS setempat secara terus (inline)
    files
      .filter((f) => f.language === 'css' && !f.isFolder)
      .forEach((cssFile) => {
        const linkRegex = new RegExp(
          `<link[^>]+href=["'](\\./)?${cssFile.name}["'][^>]*>`,
          'gi'
        );
        const styleTag = `<style>/* Diselit dari ${cssFile.name} */\n${cssFile.content}\n</style>`;
        if (linkRegex.test(doc)) {
          doc = doc.replace(linkRegex, styleTag);
        } else {
          doc = doc.replace('</head>', `${styleTag}</head>`);
        }
      });

    // Selit fail JS secara terus (inline)
    files
      .filter((f) => (f.language === 'javascript' || f.name.endsWith('.js')) && !f.isFolder)
      .forEach((jsFile) => {
        const scriptRegex = new RegExp(
          `<script[^>]+src=["'](\\./)?${jsFile.name}["'][^>]*>\\s*<\\/script>`,
          'gi'
        );
        const inlineScript = `<script>/* Diselit dari ${jsFile.name} */\ntry {\n${jsFile.content}\n} catch(err) { console.error(err.message); }\n</script>`;
        if (scriptRegex.test(doc)) {
          doc = doc.replace(scriptRegex, inlineScript);
        }
      });

    return doc;
  }, [isOpen, files, keyCounter]);

  // Kendali mesej dari iframe pratonton hanya semasa modal terbuka
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'acode-preview-console') {
        const { type, args, timestamp } = event.data;
        const newMsg: ConsoleMessage = {
          id: Math.random().toString(36).substring(2, 9),
          level: type as ConsoleLevel,
          text: (args || []).join(' '),
          timestamp: timestamp || new Date().toLocaleTimeString(),
        };

        setConsoleMessages((prev) => [...prev, newMsg]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  // Skrol automatik konsol ke bahagian bawah
  useEffect(() => {
    if (activeTab === 'console') {
      consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, activeTab]);

  const handleRefresh = () => {
    setKeyCounter((prev) => prev + 1);
  };

  const handleClearConsole = () => {
    setConsoleMessages([]);
  };

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replInput.trim()) return;

    const code = replInput.trim();
    setConsoleMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        level: 'info',
        text: `> ${code}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { source: 'acode-repl-eval', code },
        '*'
      );
    }

    setReplInput('');
  };

  const openInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const filteredLogs = consoleMessages.filter((msg) => {
    if (consoleFilter === 'all') return true;
    return msg.level === consoleFilter;
  });

  const getLevelBadge = (level: ConsoleLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={13} className="text-red-400 shrink-0" />;
      case 'warn':
        return <AlertTriangle size={13} className="text-amber-400 shrink-0" />;
      case 'info':
        return <Info size={13} className="text-sky-400 shrink-0" />;
      default:
        return <span className="text-slate-500 font-mono text-[11px] shrink-0">LOG</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all"
        style={{
          backgroundColor: theme.appBarBg,
          borderColor: theme.borderColor,
          color: theme.textColor,
        }}
      >
        {/* Bar Atas Modal */}
        <div
          className="flex items-center justify-between px-3 sm:px-5 h-12 border-b select-none shrink-0"
          style={{ borderColor: theme.borderColor }}
        >
          {/* Kiri: Tab Pilihan Paparan */}
          <div className="flex items-center gap-1 p-1 bg-black/30 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={14} />
              <span>Pratonton Web</span>
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'console'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal size={14} />
              <span>Konsol</span>
              {consoleMessages.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-full font-mono">
                  {consoleMessages.length}
                </span>
              )}
            </button>
          </div>

          {/* Tengah: Kawalan Paparan Peranti (Hanya pada Pratonton) */}
          {activeTab === 'preview' && (
            <div className="hidden sm:flex items-center gap-1 p-0.5 bg-black/30 rounded-lg">
              <button
                onClick={() => setViewportMode('responsive')}
                className={`p-1.5 rounded transition-colors ${
                  viewportMode === 'responsive'
                    ? 'bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Paparan Penuh Responsif"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded transition-colors ${
                  viewportMode === 'tablet'
                    ? 'bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Paparan Tablet (768px)"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  viewportMode === 'mobile'
                    ? 'bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Paparan Telefon (375px)"
              >
                <Smartphone size={14} />
              </button>
            </div>
          )}

          {/* Kanan: Tindakan Butang */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Muat Semula (Muat Semula Pratonton)"
            >
              <RotateCw size={15} />
            </button>

            <button
              onClick={openInNewTab}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors hidden sm:block"
              title="Buka dalam Tab Pelayar Baharu"
            >
              <ExternalLink size={15} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1"
              title="Tutup Pratonton"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Badan Modal */}
        <div className="relative flex-1 bg-slate-950 flex flex-col overflow-hidden">
          {/* Tab 1: Iframe Pratonton Langsung */}
          <div
            className={`flex-1 w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-auto ${
              activeTab === 'preview' ? 'block' : 'hidden'
            }`}
          >
            <div
              className={`h-full transition-all duration-200 bg-white shadow-xl overflow-hidden flex flex-col ${
                viewportMode === 'mobile'
                  ? 'w-[375px] max-w-full rounded-2xl border-4 border-slate-700'
                  : viewportMode === 'tablet'
                  ? 'w-[768px] max-w-full rounded-xl border-4 border-slate-700'
                  : 'w-full rounded-lg'
              }`}
            >
              <iframe
                key={keyCounter}
                ref={iframeRef}
                title="NoteMy Live Runner"
                srcDoc={htmlContent}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>

          {/* Tab 2: Konsol Pembangun */}
          <div
            className={`flex-1 flex flex-col h-full bg-[#0d1117] ${
              activeTab === 'console' ? 'flex' : 'hidden'
            }`}
          >
            {/* Bar Alat Konsol */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px] mr-1">Penapis:</span>
                {(['all', 'log', 'info', 'warn', 'error'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConsoleFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                      consoleFilter === lvl
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lvl === 'all' ? 'Semua' : lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={handleClearConsole}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                title="Kosongkan Log"
              >
                <Trash2 size={13} />
                <span>Kosongkan</span>
              </button>
            </div>

            {/* Aliran Log */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 select-text">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-600 text-center py-10 italic">
                  Tiada log konsol direkodkan setakat ini. Gunakan <code>console.log()</code> dalam kod anda.
                </div>
              ) : (
                filteredLogs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 p-1.5 rounded transition-colors ${
                      msg.level === 'error'
                        ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500'
                        : msg.level === 'warn'
                        ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-500'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="mt-0.5">{getLevelBadge(msg.level)}</div>
                    <pre className="flex-1 whitespace-pre-wrap break-all font-mono leading-relaxed">
                      {msg.text}
                    </pre>
                    <span className="text-[10px] text-slate-500 tabular-nums shrink-0 select-none">
                      {msg.timestamp}
                    </span>
                  </div>
                ))
              )}
              <div ref={consoleBottomRef} />
            </div>

            {/* Ruang Perintah Interaktif REPL */}
            <form
              onSubmit={handleReplSubmit}
              className="flex items-center gap-2 p-2.5 border-t border-slate-800 bg-[#161b22] shrink-0"
            >
              <span className="text-sky-400 font-mono font-bold select-none">&gt;</span>
              <input
                type="text"
                placeholder="Taip arahan JavaScript dan tekan Enter..."
                value={replInput}
                onChange={(e) => setReplInput(e.target.value)}
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!replInput.trim()}
                className="p-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-slate-950 rounded transition-colors"
                title="Hantar ke Konsol"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

LivePreviewModal.displayName = 'LivePreviewModal';
