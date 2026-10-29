import { FileItem, LanguageType } from '../types/editor';

export function detectLanguage(fileName: string): LanguageType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'mjs':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'md':
    case 'markdown':
      return 'markdown';
    default:
      return 'text';
  }
}

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
    <p>Ubah kode di editor dan tekan <strong>Run</strong> untuk melihat preview interaktif secara instan.</p>
    
    <div class="counter-box">
      <span class="count-label">Nilai Hitungan</span>
      <div id="count" class="count-num">0</div>
      <div class="btn-group">
        <button id="btn-dec" class="btn btn-secondary">- Kurang</button>
        <button id="btn-inc" class="btn btn-primary">+ Tambah</button>
      </div>
    </div>

    <canvas id="particleCanvas" width="340" height="140"></canvas>

    <div class="footer-note">
      Buka tab <strong>Console</strong> di panel preview untuk membaca log JavaScript!
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
    isOpen: true,
    isUnsaved: false,
    content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  margin-bottom: 14px;
}

h1 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

p {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
  line-height: 1.5;
}

.counter-box {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.count-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.count-num {
  font-size: 40px;
  font-weight: 800;
  color: #38bdf8;
  font-variant-numeric: tabular-nums;
  margin: 4px 0 12px;
}

.btn-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:active {
  transform: scale(0.96);
}

.btn-primary {
  background: #38bdf8;
  color: #0f172a;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

canvas {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8);
  margin-bottom: 14px;
}

.footer-note {
  font-size: 12px;
  color: #64748b;
}

.footer-note strong {
  color: #10b981;
}`,
  },
  {
    id: 'f3',
    name: 'app.js',
    path: '/app.js',
    language: 'javascript',
    isFolder: false,
    parentId: null,
    isOpen: true,
    isUnsaved: false,
    content: `// Selamat datang di NoteMy Live Runner!
console.log("⚡ NoteMy Runner dimulai dengan sukses!");
console.info("Info: Memuat modul animasi dan interaksi...");

let count = 0;
const countEl = document.getElementById("count");
const btnInc = document.getElementById("btn-inc");
const btnDec = document.getElementById("btn-dec");

function updateCount(val) {
  count += val;
  countEl.textContent = count;
  console.log("Tombol ditekan! Nilai baru:", count);
}

btnInc.addEventListener("click", () => updateCount(1));
btnDec.addEventListener("click", () => updateCount(-1));

// Animasi partikel interaktif
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

const particles = [];
for (let i = 0; i < 24; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    r: Math.random() * 2.5 + 1.5,
    color: Math.random() > 0.5 ? "#38bdf8" : "#818cf8",
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();
console.log("✓ Kanvas partikel berjalan!");`,
  },
  {
    id: 'f4',
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    isFolder: false,
    parentId: null,
    isOpen: false,
    isUnsaved: false,
    content: `# Panduan Teks Editor NoteMy

Selamat datang di aplikasi editor web & mobile **NoteMy**!

## Fitur Utama
1. **Virtual Quick-Keys Bar**: Baris tombol simbol di bagian bawah untuk pengetikan cepat di HP atau layar sentuh.
2. **Multi-Tab Workspace**: Buka banyak berkas sekaligus dan beralih cepat.
3. **Live Web Preview**: Jalankan berkas HTML/CSS/JS secara langsung dengan satu klik tombol **Run**.
4. **In-App Developer Console**: Menangkap pesan \`console.log\`, \`console.warn\`, dan \`console.error\` layaknya DevTools browser.
5. **Ekspor Proyek ZIP**: Unduh semua berkas proyek Anda kapan saja dalam satu arsip ZIP.
6. **Multi-Tema**: NoteMy Dark, AMOLED Black, One Dark, Dracula, Monokai, dan GitHub Light.

## Pintasan Keyboard (Desktop)
- \`Ctrl + S\` : Simpan berkas
- \`Ctrl + F\` : Buka Find & Replace
- \`Tab\` : Indentasi 2 spasi
`,
  },
  {
    id: 'f5',
    name: 'script.py',
    path: '/script.py',
    language: 'python',
    isFolder: false,
    parentId: null,
    isOpen: false,
    isUnsaved: false,
    content: `# Contoh script Python di NoteMy Editor

def sapa_pengguna(nama):
    """Menyapa pengguna dengan ramah"""
    pesan = f"Halo {nama}, selamat datang di NoteMy!"
    return pesan

daftar_nama = ["Budi", "Siti", "Ahmad"]

for nama in daftar_nama:
    print(sapa_pengguna(nama))
`,
  },
];

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  files: FileItem[];
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-starter',
    name: 'Web Starter (HTML/CSS/JS)',
    description: 'Aplikasi interaktif dengan counter, styling modern, dan animasi canvas.',
    badge: 'Populer',
    files: DEFAULT_FILES,
  },
  {
    id: 'canvas-game',
    name: 'Mini Canvas Game (Snake)',
    description: 'Game ular klasik dengan skor dan kontrol tombol interaktif.',
    badge: 'Game',
    files: [
      {
        id: 'g1',
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        isFolder: false,
        parentId: null,
        isOpen: true,
        isUnsaved: false,
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NoteMy Snake Game</title>
  <style>
    body { background: #0f172a; color: white; text-align: center; font-family: sans-serif; padding: 15px; }
    canvas { background: #1e293b; border-radius: 8px; border: 2px solid #38bdf8; display: block; margin: 10px auto; }
    .controls { display: grid; grid-template-columns: repeat(3, 60px); gap: 6px; justify-content: center; margin-top: 10px; }
    button { background: #334155; color: white; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; }
    button:active { background: #38bdf8; color: #0f172a; }
    .score-badge { font-size: 18px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <h2>Snake Game NoteMy</h2>
  <div>Skor: <span id="score" class="score-badge">0</span></div>
  <canvas id="game" width="300" height="300"></canvas>
  <div class="controls">
    <div></div><button id="up">▲</button><div></div>
    <button id="left">◀</button><button id="down">▼</button><button id="right">▶</button>
  </div>
  <script>
    console.log("Game Snake siap dimainkan!");
    const cv = document.getElementById("game");
    const ctx = cv.getContext("2d");
    const grid = 15;
    let count = 0;
    let snake = [{x: 150, y: 150}];
    let dx = grid, dy = 0;
    let food = {x: 60, y: 60};
    let score = 0;

    function loop() {
      requestAnimationFrame(loop);
      if (++count < 6) return;
      count = 0;

      ctx.clearRect(0, 0, cv.width, cv.height);
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};

      // Wrap border
      if (head.x < 0) head.x = cv.width - grid;
      else if (head.x >= cv.width) head.x = 0;
      if (head.y < 0) head.y = cv.height - grid;
      else if (head.y >= cv.height) head.y = 0;

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").textContent = score;
        console.log("Makanan didapat! Skor:", score);
        food.x = Math.floor(Math.random() * (cv.width / grid)) * grid;
        food.y = Math.floor(Math.random() * (cv.height / grid)) * grid;
      } else {
        snake.pop();
      }

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(food.x, food.y, grid - 1, grid - 1);

      ctx.fillStyle = "#10b981";
      snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#34d399" : "#10b981";
        ctx.fillRect(part.x, part.y, grid - 1, grid - 1);
      });
    }

    document.getElementById("up").onclick = () => { if (dy === 0) { dx = 0; dy = -grid; } };
    document.getElementById("down").onclick = () => { if (dy === 0) { dx = 0; dy = grid; } };
    document.getElementById("left").onclick = () => { if (dx === 0) { dx = -grid; dy = 0; } };
    document.getElementById("right").onclick = () => { if (dx === 0) { dx = grid; dy = 0; } };

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -grid; }
      else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = grid; }
      else if (e.key === "ArrowLeft" && dx === 0) { dx = -grid; dy = 0; }
      else if (e.key === "ArrowRight" && dx === 0) { dx = grid; dy = 0; }
    });

    requestAnimationFrame(loop);
  </script>
</body>
</html>`,
      },
    ],
  },
];
