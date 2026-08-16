---
name: commit
description: Standar operasional mutlak bagi agen AI untuk melakukan git commit dengan meminta persetujuan terlebih dahulu.
---

# Panduan Workflow: Melakukan Git Commit

Dokumen ini mendefinisikan standar operasional (SOP) **MUTLAK** bagi Agen AI ketika pengguna meminta untuk melakukan commit (misal: "commit kan", "tolong di commit"). Agen AI **DILARANG KERAS** melanggar urutan langkah-langkah di bawah ini.

## Langkah-langkah (SOP)

### 1. Periksa Status & Lakukan Staging
Selalu mulai dengan memeriksa status file yang berubah menggunakan perintah:
`git status`
Setelah itu, Anda diizinkan untuk langsung melakukan *staging* pada semua file yang berubah menggunakan:
`git add .`

*(Pengecualian: Jika ada peringatan perubahan pada file konfigurasi sistem di luar proyek, tanyakan dulu pada pengguna).*

### 2. Susun Pesan Commit (Conventional Commits) & MINTA PERSETUJUAN
Gunakan standar **Conventional Commits** untuk menulis pesan commit. Strukturnya:
`<tipe>(<scope/modul>): <deskripsi singkat>`

**Tipe yang diizinkan:**
- `feat`: Fitur baru.
- `fix`: Perbaikan *bug* / *error*.
- `style`: Perubahan tampilan, format kode, UI, tanpa mengubah logika.
- `refactor`: Perombakan kode (tidak menambah fitur atau memperbaiki *bug*).
- `docs`: Perubahan dokumentasi saja (contoh: README, komentar).
- `chore`: Tugas pemeliharaan, *update* dependensi, modifikasi konfigurasi.

**Contoh Pesan:**
- `feat(applayanan/pemberkasan): tambahkan fitur upload dokumen persayaratan otomatis`
- `fix(appbkpp/profil): perbaiki error saat menyimpan data alamat`

**ATURAN MUTLAK:** Sebelum menjalankan perintah `git commit`, Anda **HARUS** menampilkan rancangan pesan commit tersebut kepada pengguna dan **MEMINTA PERSETUJUAN EKSPLISIT** ("Apakah Anda setuju dengan pesan commit ini?").

### 3. Eksekusi Commit
Setelah pengguna mereview dan menyetujui pesan commit, barulah Anda boleh menjalankan perintah commit:
`git commit -m "tipe(scope): deskripsi singkat"`

### 4. Laporkan Hasilnya
Informasikan kepada pengguna bahwa proses *commit* telah berhasil.
