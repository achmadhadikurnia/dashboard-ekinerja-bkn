# Dashboard Report Kinerja (E-Kinerja BKN)

Aplikasi Web terintegrasi berbasis **Google Apps Script (GAS)** dan **Google Sheets** untuk mempermudah instansi dalam mengunggah, merekap, menganalisis, dan mencetak laporan kinerja (SKP) pegawai yang diunduh dari sistem E-Kinerja BKN.

👉 **Dapatkan Produknya [di Sini (lynk.id/achmadhadikurnia)](https://lynk.id/achmadhadikurnia)**

## 🚀 Fitur Utama

- **Upload & Ekstrak Pintar (Client-Side Parsing)**: Menggunakan pustaka *SheetJS (XLSX)*, file Excel dibaca langsung di browser klien. Tidak perlu mengunggah file mentah ke Google Drive. Sangat cepat dan menghemat kuota penyimpanan.
- **Sinkronisasi Otomatis**: Secara cerdas membedakan antara file "Laporan SKP" (Data Master) dan "Laporan Penilaian SKP" (Data Bulanan), lalu otomatis memperbarui lembar kerja (*sheet*) yang sesuai di database.
- **Pengiriman Data Bertahap (Chunking)**: Mencegah batas waktu eksekusi (timeout) Google Apps Script saat memproses ribuan baris data pegawai dengan membagi data menjadi pecahan kecil (500 baris per kirim).
- **Dashboard Analitik Dinamis**: Menampilkan ringkasan statistik secara *real-time* dengan antarmuka modern (Glassmorphism) dan notifikasi interaktif (SweetAlert2).
- **Filter Canggih**: Mendukung pencarian dan penyaringan berdasarkan Nama/NIP, Unit Kerja/OPD, Status Kinerja (Sudah/Belum), dan Periode Bulan.
- **Ekspor PDF Cerdas**: Terintegrasi dengan *jsPDF* & *autoTable*. Kolom tabel PDF menyesuaikan secara dinamis—jika difilter 1 bulan, hanya kolom nilai bulan tersebut yang dicetak, meminimalisir teks terpotong dan membuat desain lebih elegan.

## 🏗️ Arsitektur Sistem

Aplikasi ini menggunakan pola **Frontend-Backend (Client-Server)** di dalam ekosistem Google:

1. **`index.html` (Frontend / Client UI)**:
   - Antarmuka pengguna (UI) berbasis HTML, CSS, JS.
   - Menangani unggahan dan pembacaan file Excel.
   - Menyajikan data ke dalam bentuk tabel *dashboard* dan menangani interaksi pengguna.
   - Mengelola ekspor data ke PDF.
2. **`code.js` (Backend / Server Script)**:
   - *Entry point* untuk Web App (`doGet`).
   - Menerima potongan data (chunks) dari *frontend* dan menyimpannya ke Google Sheets (`uploadLaporanChunk`).
   - Memproses rekapitulasi data secara otomatis (`processUploadSync`, `generateMasterPegawai`, `_updateNilaiBulan`).
   - Menyediakan API internal untuk menarik ringkasan data ke *dashboard* (`getDashboardData`, `getPegawaiData`).
3. **Google Sheets (Database)**:
   - Bertindak sebagai RDBMS. Terdiri dari sheet mentah (`skp`, `jan` s/d `des`, `tahunan`) dan sheet agregasi (`pegawai`, `opd`, `pengecualian`).

## 🛠️ Panduan Instalasi (Deployment)

1. Buat Spreadsheet baru di Google Sheets.
2. Buka menu **Ekstensi > Apps Script**.
3. Hapus kode bawaan (jika ada) lalu tempel (*paste*) isi file `code.js` ke dalam file `Code.gs`.
4. Buat file HTML baru dengan nama `index.html` (huruf kecil semua), dan tempel isi file `index.html` ke dalamnya.
5. Simpan (Save) proyek.
6. Klik **Terapkan (Deploy) > Deployment Baru (New Deployment)**.
7. Pilih jenis **Aplikasi Web (Web App)**.
8. Atur hak akses: *Execute as: Me*, *Who has access: Anyone* (atau sesuai kebijakan instansi).
9. Otorisasi izin akses (*Authorization*) Google.
10. Salin URL Web App yang dihasilkan.

## 📖 Cara Penggunaan

1. **Unduh Data**: Unduh laporan Excel (Laporan SKP / Penilaian SKP) dari aplikasi E-Kinerja BKN.
2. **Unggah ke Dashboard**: Buka URL Web App, masuk ke tab "Upload Laporan", dan pilih file Excel tersebut.
3. **Pemrosesan Otomatis**: Klik "Proses". Sistem akan membedah isi Excel dan menyinkronkannya ke *database* Google Sheets.
4. **Analisis & Cetak**: Masuk ke menu "Daftar Pegawai" atau "Rekap OPD", gunakan filter yang disediakan, lalu klik ikon **Unduh PDF** untuk mencetak laporan.

## 🔒 Keamanan & Privasi Data

Data instansi dan pegawai Anda **sangat aman**. Aplikasi ini berjalan 100% di dalam lingkungan Google Workspace (akun Google) milik Anda sendiri.
- **Pemrosesan Lokal (Client-Side)**: File Excel dibaca dan diproses langsung di perangkat Anda tanpa pernah diunggah ke pihak ketiga.
- **Tanpa Server Pihak Ketiga**: Seluruh data disimpan langsung ke Google Sheets Anda. Tidak ada satu pun data yang dibagikan, dikirim, atau diakses oleh pengembang aplikasi. Privasi data terjamin sepenuhnya.

## 🛒 Dapatkan Produk Ini

Tertarik menggunakan **Dashboard Report Kinerja** untuk instansi Anda? Anda dapat membeli *source code* dan produk lengkapnya melalui tautan berikut:
👉 **Beli Produk di [lynk.id/achmadhadikurnia](https://lynk.id/achmadhadikurnia)**

---
*Dibuat untuk memudahkan manajemen sumber daya aparatur dan monitoring kepatuhan pelaporan kinerja.*
