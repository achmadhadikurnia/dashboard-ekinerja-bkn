---
name: build
description: Standar operasional bagi agen AI untuk melakukan proses build dengan mengumpulkan file-file spesifik ke dalam folder build.
---

# Panduan Workflow: Melakukan Build

Dokumen ini mendefinisikan standar operasional (SOP) bagi Agen AI ketika pengguna meminta untuk melakukan proses *build* (menggunakan perintah `/build` atau "tolong di build"). Inti dari proses *build* ini hanyalah menyalin (*copy*) file-file utama ke dalam folder `build`.

## Langkah-langkah (SOP)

### 1. Persiapkan Folder Build
Buat direktori/folder bernama `build` di dalam *root* proyek. Jika folder `build` belum ada, buatlah terlebih dahulu menggunakan perintah PowerShell (contoh: `New-Item -ItemType Directory -Force -Path "build"`).

### 2. Eksekusi Proses Copy (Build)
Sesuai instruksi mutlak pengguna, **HANYA** salin (*copy*) file-file berikut ini ke dalam folder `build` tersebut:
- `README.md`
- `INSTALASI.txt`
- `CARA_PENGGUNAAN.txt`
- `code.gs`
- `dashboard.xlsx`
- `index.html`

Pastikan menimpa (*overwrite*) file lama jika sudah ada (gunakan parameter `-Force`). Anda bisa menggunakan perintah PowerShell seperti:
`Copy-Item -Path "README.md", "INSTALASI.txt", "CARA_PENGGUNAAN.txt", "code.gs", "dashboard.xlsx", "index.html" -Destination "build\" -Force`

### 3. Laporkan Hasil
Laporkan kepada pengguna bahwa proses *build* telah selesai. Beritahukan bahwa seluruh file yang dibutuhkan untuk tahap pengujian sudah terkumpul dengan rapi di dalam folder `build/`.
