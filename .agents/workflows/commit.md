---
name: commit
description: Standar operasional mutlak bagi agen AI untuk melakukan git commit dengan meminta persetujuan terlebih dahulu.
---

# Panduan Workflow: Melakukan Git Commit

Dokumen ini mendefinisikan standar operasional (SOP) **MUTLAK** bagi Agen AI ketika pengguna meminta untuk melakukan commit (misal: "commit kan", "tolong di commit"). Agen AI **DILARANG KERAS** melanggar urutan langkah-langkah di bawah ini.

## Langkah-langkah (SOP)

### 1. Periksa Status Repositori & LAPORKAN
Selalu mulai dengan memeriksa status file yang berubah menggunakan perintah:
`git status`
*Tujuan: Memastikan file mana saja yang telah dimodifikasi, ditambah, atau dihapus.*
**ATURAN MUTLAK:** Setelah menjalankan `git status`, Anda **DIWAJIBKAN** untuk berhenti dan melaporkan status tersebut kepada pengguna. Tanyakan kepada pengguna file mana saja yang ingin mereka masukkan (*stage*) ke dalam commit ini.

### 2. Seleksi File yang Akan Di-commit (Staging)
Hanya tambahkan file (`git add`) yang **spesifik diizinkan oleh pengguna** atau yang benar-benar Anda kerjakan. 
- Gunakan spesifik file: `git add path/to/file1 path/to/file2`
- **ATURAN MUTLAK:** Anda **HARAM / DILARANG KERAS** menggunakan `git add .`, `git add -A`, atau `git commit -a` dalam kondisi apa pun. Tidak ada pengecualian. Menambahkan file secara masal sering kali memasukkan file yang tidak relevan.
- **Peringatan Ekstra:** Abaikan file apa pun yang berada di luar direktori proyek (contoh: folder `Downloads`, `Documents`, dll.) yang mungkin tidak sengaja diedit oleh pengguna.

### 3. Susun Pesan Commit (Conventional Commits) & MINTA PERSETUJUAN
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

### 4. Eksekusi Commit
Setelah pengguna menyetujui pesan commit dan file yang akan di-stage, barulah Anda boleh menjalankan perintah commit:
`git commit -m "tipe(scope): deskripsi singkat"`

### 5. Laporkan Hasilnya
Informasikan kepada pengguna bahwa proses *commit* telah berhasil.
