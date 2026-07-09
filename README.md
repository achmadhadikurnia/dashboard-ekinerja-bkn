# Dashboard Report E-Kinerja BKN

Aplikasi Web terintegrasi berbasis **Google Apps Script (GAS)** dan **Google Sheets** untuk mempermudah instansi dalam mengunggah, merekap, menganalisis, dan mencetak laporan kinerja (SKP) pegawai yang diunduh dari sistem E-Kinerja BKN.

👉 **Dapatkan Produknya [di Sini (lynk.id/achmadhadikurnia)](https://lynk.id/achmadhadikurnia)**

## 🚀 Fitur Utama

- **Upload & Ekstrak Pintar (Client-Side Parsing)**: Menggunakan pustaka *SheetJS (XLSX)*, file Excel dibaca langsung di browser klien. Tidak perlu mengunggah file mentah ke Google Drive. Sangat cepat dan menghemat kuota penyimpanan.
- **Sinkronisasi Otomatis**: Secara cerdas membedakan antara file "Laporan SKP" (Data Master) dan "Laporan Penilaian SKP" (Data Bulanan), lalu otomatis memperbarui lembar kerja (*sheet*) yang sesuai di database.
- **Pengiriman Data Bertahap (Chunking)**: Mencegah batas waktu eksekusi (timeout) Google Apps Script saat memproses ribuan baris data pegawai dengan membagi data menjadi pecahan kecil (500 baris per kirim).
- **Dashboard Analitik Dinamis**: Menampilkan ringkasan statistik secara *real-time* dengan antarmuka modern (Glassmorphism) dan notifikasi interaktif (SweetAlert2).
- **Filter Canggih**: Mendukung pencarian dan penyaringan berdasarkan Nama/NIP, Unit Kerja/OPD, Status Kinerja (Sudah/Belum), dan Periode Bulan.
- **Ekspor PDF Cerdas**: Terintegrasi dengan *jsPDF* & *autoTable*. Kolom tabel PDF menyesuaikan secara dinamis—jika difilter 1 bulan, hanya kolom nilai bulan tersebut yang dicetak, meminimalisir teks terpotong dan membuat desain lebih elegan.
- **Fitur Pengecualian**: Menyaring pegawai dengan status khusus (Pensiun, Mutasi, Hukdis, dsb) agar terpisah dan tidak tercatat secara keliru sebagai pegawai yang belum menyusun SKP.
- **Reset Database**: Fitur pengosongan data secara cepat dan permanen dengan satu klik, sambil tetap mempertahankan konfigurasi utama (Pengaturan) agar aplikasi siap digunakan ulang kapan saja.

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

1. **Siapkan Template**: Upload file template `dashboard.xlsx` ke Google Drive Anda.
2. **Konversi ke Spreadsheet**: Buka file tersebut di Google Drive web, lalu klik menu **File > Save as Google Sheets**.
3. **Buka Editor Script**: Dari file Google Sheets yang baru saja dibuat, klik menu **Extensions > Apps Script**.
4. **Pasang Kode Backend**: Salin (*copy*) seluruh isi file `code.js` dan tempelkan (*paste*) ke dalam file `Code.gs` (timpa kode bawaannya).
5. **Pasang Kode Frontend**: Klik logo tambah `(+) > HTML`, beri nama persis `index` (huruf kecil). Hapus kode bawaannya, lalu salin seluruh isi file `index.html` ke dalamnya.
6. **Simpan**: Klik ikon disket untuk menyimpan proyek (Save).
7. **Proses Deploy**:
   - Klik tombol biru **Deploy** di pojok kanan atas, lalu pilih **New deployment**.
   - Klik ikon **gerigi (⚙️)** di sebelah "Select type", lalu pilih **Web app**.
   - Isi form *Description* (bebas).
   - Atur pengaturan Web App: *Execute as* pilih **Me**, dan *Who has access* pilih **Anyone** (atau batasi khusus akun instansi).
   - Klik tombol **Deploy**.
8. **Otorisasi Keamanan**:
   - Klik tombol **Authorize access**.
   - Pilih akun Google Anda. Jika muncul peringatan keamanan Google, klik teks **Advanced** di bagian bawah, lalu klik **Go to ... (unsafe)**. Klik **Continue/Allow** di halaman berikutnya.
9. **Selesai**: Akan muncul URL Web App (berakhiran `/exec`). Salin *link* tersebut. Klik **Done**. Buka URL yang disalin tadi di browser untuk menggunakan Dashboard!

> [!TIP]
> **Penting Saat Mengubah Kode!**
> Jika Anda mengubah atau memperbarui kode di masa depan, menekan tombol *Save* saja **TIDAK** akan mengubah hasil di *link* utama (`/exec`). Anda **WAJIB** melakukan klik **Deploy > New deployment** lagi agar kode terbaru dipublikasikan.
>
> *Alternatif*: Jika Anda sedang menguji coba perubahan kode, gunakan **Deploy > Test deployments**, lalu klik *link* Web App yang diberikan (berakhiran `/dev`). Link `/dev` ini akan selalu merespons kode terbaru secara instan setiap kali Anda menekan *Save*.

## 📖 Cara Penggunaan

1. **Unduh Data**: Unduh laporan Excel (Laporan SKP atau Penilaian SKP Bulanan/Tahunan) dari aplikasi E-Kinerja BKN instansi Anda.
2. **Buka Aplikasi Dashboard**: Buka URL Web App (link `/exec`) yang Anda peroleh setelah proses *Deployment*, melalui browser (direkomendasikan Google Chrome).
3. **Login Admin**: Gunakan kredensial (akun) bawaan untuk masuk: Username `adminkinerja` dan Password `sangatbaik`.
4. **Unggah Data**: Masuk ke menu "Upload Laporan", lalu klik area pencarian file untuk memilih file Excel hasil unduhan dari E-Kinerja BKN.
5. **Sinkronisasi Data**: Klik "Proses File (Sync)". Sistem akan membedah isi Excel secara otomatis dan menyinkronkannya ke dalam database Google Sheets Anda secara bertahap tanpa takut *timeout*.
6. **Analisis, Filter, & Cetak (Unduh PDF)**: Masuk ke menu "Daftar Pegawai" atau "Rekap OPD", gunakan filter pencarian yang disediakan, lalu klik tombol **Unduh PDF** untuk mencetak laporan. Kolom tabel PDF akan menyesuaikan diri secara otomatis.

## 🔐 Default Login Admin

Aplikasi ini dilengkapi sistem penguncian (login) pada halaman sensitif seperti Data Pegawai dan Upload Laporan. Kredensial default untuk masuk adalah:
- **Username:** `adminkinerja`
- **Password:** `sangatbaik`

> [!TIP]
> Anda dapat mengganti username dan password ini kapan saja melalui file Google Sheets Anda. Buka sheet **`pengaturan`**, lalu ubah nilai di sebelah sel Username (sel B2) dan Password (sel B3).

## 🔒 Keamanan & Privasi Data

Data instansi dan pegawai Anda **sangat aman**. Aplikasi ini berjalan 100% di dalam lingkungan Google Workspace (akun Google) milik Anda sendiri.
- **Pemrosesan Lokal (Client-Side)**: File Excel dibaca dan diproses langsung di perangkat Anda tanpa pernah diunggah ke pihak ketiga.
- **Tanpa Server Pihak Ketiga**: Seluruh data disimpan langsung ke Google Sheets Anda. Tidak ada satu pun data yang dibagikan, dikirim, atau diakses oleh pengembang aplikasi. Privasi data terjamin sepenuhnya.

## 🛒 Dapatkan Produk Ini

Tertarik menggunakan **Dashboard Report Kinerja** untuk instansi Anda? Anda dapat membeli *source code* dan produk lengkapnya melalui tautan berikut:
👉 **Beli Produk di [lynk.id/achmadhadikurnia](https://lynk.id/achmadhadikurnia)**

---
*Dibuat untuk memudahkan manajemen sumber daya aparatur dan monitoring kepatuhan pelaporan kinerja.*
