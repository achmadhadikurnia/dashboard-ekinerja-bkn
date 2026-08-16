---
name: release
description: Standar operasional bagi agen AI untuk melakukan proses rilis versi baru dengan membundel file-file spesifik ke dalam arsip zip.
---

# Panduan Workflow: Melakukan Rilis (Release & Versioning)

Dokumen ini mendefinisikan standar operasional (SOP) bagi Agen AI ketika pengguna meminta untuk melakukan proses rilis versi baru (menggunakan perintah `/release`).

## Langkah-langkah (SOP)

### 1. Konfirmasi Versi Rilis
Jika pengguna belum memberikan nomor versi (contoh: `v1.0.0`, `v1.1`, dsb.) bersamaan dengan perintah `/release`, **berhenti dan tanyakan terlebih dahulu** versi rilis apa yang ingin dibuat.

### 2. Persiapkan Folder Utama (Releases)
Pastikan folder utama `releases` sudah ada di dalam *root* proyek. Jika belum ada, buatlah menggunakan perintah PowerShell (contoh: `New-Item -ItemType Directory -Force -Path "releases"`).

### 3. Eksekusi Proses ZIP (Release)
Sesuai instruksi mutlak pengguna, jangan buat folder dengan nama versi, melainkan **LANGSUNG** kompres file-file berikut ini ke dalam sebuah file `.zip` (misal: `releases/dashboard-ekinerja-bkn-v1.0.0.zip`):
- `README.md`
- `INSTALASI.txt`
- `CARA_PENGGUNAAN.txt`
- `code.gs`
- `dashboard.xlsx`
- `index.html`

Gunakan perintah PowerShell `Compress-Archive` untuk menyeleksi file dan menjadikannya zip. Contoh perintah:
`Compress-Archive -Path "README.md", "INSTALASI.txt", "CARA_PENGGUNAAN.txt", "code.gs", "dashboard.xlsx", "index.html" -DestinationPath "releases/dashboard-ekinerja-bkn-<versi>.zip" -Force`

### 4. Buat Git Tag dan Push (Otomatis Trigger GitHub Actions)
Setelah ZIP lokal berhasil dibuat, secara otomatis buat *git tag* untuk versi tersebut dan dorong (*push*) tag-nya ke repositori remote agar proses rilis di GitHub (GitHub Actions) dapat berjalan:
`git tag <versi>; git push --tags`

### 5. Laporkan Hasil
Laporkan kepada pengguna bahwa proses *release* lokal dan *push tag* ke Git telah selesai. Beritahukan juga bahwa saat ini GitHub Actions sedang memproses perilisan resminya secara otomatis di server.
