# Acode Web & Mobile Code Editor

Acode adalah editor kode dan teks profesional yang dioptimalkan untuk perangkat mobile maupun desktop, dilengkapi dengan virtual quick-keys bar khas Acode, multi-file explorer, live preview interaktif dengan in-app developer console, dan pilihan tema visual yang kaya.

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda pilih:
> - **Tata Letak & UX**: Mode responsif dengan Virtual Quick-Keys bar ala Acode mobile yang menempel di atas keyboard/layar bawah untuk akses kilat simbol kode (`{`, `}`, `(`, `)`, `;`, `tab`, dll.).
> - **Fitur Eksekusi**: Live Web Preview terintegrasi langsung di dalam aplikasi dilengkapi tab Console interaktif yang menangkap `console.log`, `warn`, dan `error`.
> - **Tema Visual**: Pilihan multi-tema bawaan meliputi Acode Dark, AMOLED Black, One Dark, Dracula, Monokai, dan GitHub Light.

---

### 1. Overview & Core Concept

- **What It Does**: Aplikasi web IDE dan editor teks berkinerja tinggi yang mereplikasi pengalaman intuitif aplikasi Acode di Android. Pengguna dapat membuat, mengedit, mengorganisasi berkas proyek (HTML, CSS, JS, JSON, Python, Markdown), mengetik dengan cepat menggunakan baris tombol pintas simbolik, melihat hasil kode secara real-time di live preview, membaca log JavaScript secara instan, serta mengunduh proyek dalam format ZIP atau berkas tunggal.
- **Target Audience**: Pengembang web, pelajar pemrograman, dan kreator yang ingin menulis kode di tablet, smartphone, maupun laptop tanpa instalasi rumit.
- **Key Value**: Pengalaman coding cepat dan nyaman dengan ergonomi sentuh, tanpa hambatan keyboard ponsel standar saat mengetik karakter pemrograman.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Eksplorasi & Manajemen Berkas*: Membuka laci sisi (sidebar/drawer) untuk menambah berkas/folder baru, beralih berkas melalui tab di bagian atas, atau mengunduh arsip proyek.
  2. *Pengetikan Kode & Quick-Keys*: Mengetik dengan nomor baris otomatis, penyorotan sintaks (*syntax highlighting*), lekukan otomatis (*auto-indent*), dan menekan tombol di baris pintas virtual (`Tab`, `{`, `}`, `(`, `)`, `[`, `]`, `""`, `;`, `=`, `<>`, `Undo`, `Redo`) untuk menyisipkan karakter langsung ke posisi kursor.
  3. *Live Preview & Console*: Menekan tombol Run (Play) untuk membuka panel preview web (bisa split-screen di desktop atau sheet/modal layar penuh di mobile), memeriksa tampilan responsif, dan membuka tab Console untuk melihat pesan log langsung dari skrip pengguna.
  4. *Kustomisasi & Pengaturan*: Mengubah tema warna (One Dark, Dracula, Monokai, AMOLED, Light), ukuran font editor, wrap baris kode, dan ukuran tab spasi melalui dialog preferensi.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian IDE modern dengan sentuhan khas Acode (header gelap pekat dengan aksen biru safir, tab minimalis tanpa border tebal, serta font monospaced berkualitas tinggi).
  - *Color Palette & Tokens*:
    - Latar Kanvas Acode Dark: `#15181E` / `#0D1117`
    - Bilah Header & Tab Bar: `#1C2128`
    - Aksentuasi Utama (Active / Run): Emerald cerah `#10B981` dan Azure `#38BDF8`
    - Border Hairline: `rgba(255, 255, 255, 0.08)`
  - *Typography*: UI menggunakan font sans modern yang bersih (`Plus Jakarta Sans`), sedangkan area kode menggunakan font monospace tajam (`JetBrains Mono`, `Fira Code`, atau `ui-monospace`) dengan dukungan angka tabular (`tabular-nums`).

- **Interactive Feedback & Ergonomics**:
  - Tombol pintas virtual dengan respons haptik visual sentuh (`active:scale-95` dan perubahan kontras seketika $\le 100\text{ms}$).
  - Indikator berkas belum tersimpan (*dirty state dot*) pada tab aktif.
  - Dialog modal pencarian dan penggantian teks (*Find & Replace*) dengan navigasi hasil pencocokan.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Engine Editor & Syntax Highlighting**
  - *Chosen Approach*: Komponen editor kustom berbasis `textarea` transparan berlapis dengan overlay renderer sintaks berkinerja tinggi, dilengkapi kontrol kursor seleksi akurat, sinkronisasi scroll baris angka, dan pintasan keyboard standar.
  - *Why*: Sangat ringan, kompatibel 100% dengan keyboard virtual Android/iOS (IME autocomplete tidak rusak), hemat memori, dan bebas dari ketergantungan ekstensi Monaco yang sangat berat di mobile.
  - *Alternatives Considered*: Monaco Editor (terlalu lambat di mobile dan bermasalah pada keyboard sentuh Android), Ace Editor external CDN (rawan pemblokiran di sandbox).

- **Decision 2: Sandboxed Live Preview & Console Bridge**
  - *Chosen Approach*: Eksekusi di dalam iframe ber-sandbox aman (`sandbox="allow-scripts allow-modals"`) dengan skrip injeksi ringan yang mem-proxy `console.log`, `info`, `warn`, dan `error` kembali ke state editor melalui `window.postMessage`.
  - *Why*: Menjamin keamanan aplikasi host, mengisolasi error runtime pengguna, dan menyediakan panel konsol interaktif persis seperti DevTools browser.

- **Decision 3: Penyimpanan Data & Ekspor**
  - *Chosen Approach*: `localStorage` untuk persistensi otomatis pohon berkas dan preferensi editor, ditambah integrasi ekspor berkas lokal dan ekspor seluruh folder proyek ke arsip `.zip`.
  - *Why*: Bekerja secara instan tanpa login atau backend server, menjamin data pengguna tidak hilang saat halaman dimuat ulang.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Acode Applet Root                     │
├──────────────────────────┬─────────────────────────────┤
│ Top App Bar              │ Actions (Run, Theme, Share) │
├──────────────────────────┴─────────────────────────────┤
│ Tab Bar (Active Open Files, Close Button, Dirty State)  │
├───────────────┬────────────────────────────────────────┤
│ File Explorer │ Editor Core Workspace                  │
│ Sidebar/Drawer│  - Line Numbers Rail                   │
│               │  - Syntax Highlighting Overlay         │
│  - New File   │  - Transparent Input Layer             │
│  - New Folder │  - Find & Replace Overlay Bar          │
│  - Tree View  ├────────────────────────────────────────┤
│  - Export ZIP │ Virtual Quick-Keys Toolbar             │
│               │ (<, >, {, }, (, ), Tab, ;, =, Undo...) │
├───────────────┴────────────────────────────────────────┤
│ Live Preview & Console Drawer / Modal                  │
│  - Sandboxed iframe runner (HTML+CSS+JS bundled)       │
│  - Interactive Console Log Viewer with Log Filtering   │
└────────────────────────────────────────────────────────┘
```

- **File & State Model**:
  - `FileItem`: `{ id, name, path, content, language, isFolder, parentId, isOpen }`
  - `EditorSettings`: `{ theme, fontSize, tabSize, wordWrap, autoCloseBrackets }`
  - `ConsoleMessage`: `{ id, level: 'log'|'warn'|'error'|'info', text, timestamp }`
- **Starter Template Projects**: Disediakan template bawaan (Web Starter HTML/CSS/JS interaktif, Kalkulator JS, Canvas Game mini, dan Catatan Markdown) agar pengguna langsung dapat mencoba fitur Run & Preview sejak awal.
