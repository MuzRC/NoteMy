import { FileItem } from '../types/editor';

/**
 * Pengesan bahasa berdasarkan sambungan nama fail.
 * Menyokong TypeScript (.ts, .tsx), JavaScript (.js, .jsx), HTML, CSS, JSON, Markdown, dll.
 */
export function detectLanguage(fileName: string): string {
  if (!fileName || !fileName.includes('.')) return 'text';
  
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'tsx';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jsx':
      return 'jsx';
    case 'html':
    case 'htm':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    default:
      return 'text';
  }
}

/**
 * Fail permulaan default sekiranya localStorage masih kosong.
 */
export const DEFAULT_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'index.html',
    path: '/index.html',
    language: 'html',
    isFolder: false,
    parentId: null,
    isOpen: true,
    isUnsaved: false,
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoteMy Live Demo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <div class="badge">NoteMy Web & Mobile</div>
    <h1>Halo dari Editor NoteMy!</h1>
    <p>Ubah kode di editor dan tekan <strong>Run</strong> untuk melihat hasil langsung.</p>
    
    <div class="counter-box">
      <span class="count-label">Nilai Hitungan:</span>
      <div id="count" class="count-num">0</div>
      <div class="btn-group">
        <button id="btn-dec" class="btn btn-secondary">- Kurang</button>
        <button id="btn-inc" class="btn btn-primary">+ Tambah</button>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
  },
  {
    id: 'f2',
    name: 'styles.css',
    path: '/styles.css',
    language: 'css',
    isFolder: false,
    parentId: null,
    isOpen: false,
    isUnsaved: false,
    content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 28px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

p {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 20px;
}

.counter-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.count-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
}

.count-num {
  font-size: 36px;
  font-weight: 800;
  color: #38bdf8;
  margin: 8px 0 14px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:active {
  opacity: 0.8;
}

.btn-primary {
  background: #0284c7;
  color: #ffffff;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}`,
  },
  {
    id: 'f3',
    name: 'app.js',
    path: '/app.js',
    language: 'javascript',
    isFolder: false,
    parentId: null,
    isOpen: false,
    isUnsaved: false,
    content: `// Logika Interaktif NoteMy
let count = 0;
const countEl = document.getElementById('count');
const btnInc = document.getElementById('btn-inc');
const btnDec = document.getElementById('btn-dec');

function updateDisplay() {
  if (countEl) {
    countEl.textContent = count;
  }
}

if (btnInc) {
  btnInc.addEventListener('click', () => {
    count++;
    updateDisplay();
    console.log('Nilai bertambah:', count);
  });
}

if (btnDec) {
  btnDec.addEventListener('click', () => {
    count--;
    updateDisplay();
    console.log('Nilai berkurang:', count);
  });
}

console.log('Aplikasi NoteMy siap dijalankan!');`,
  },
];
