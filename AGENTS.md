# 🤖 AI Vibe Coding Guidelines untuk Dashboard Report E-Kinerja BKN

Selamat datang, AI Assistant! Dokumen ini adalah panduan spesifik (SOP) untuk melakukan *vibe coding* pada repositori **Report Kinerja (E-Kinerja BKN)**. Proyek ini adalah Web App berbasis **Google Apps Script (GAS)** dengan **Google Sheets** sebagai *database*.

Harap baca aturan ini dengan saksama **sebelum menulis atau memodifikasi kode apa pun** agar tidak memecahkan logika atau memicu *error sandbox* pada ekosistem Google.

---

## 🏗️ 1. Arsitektur & Tech Stack
- **Backend (Server)**: `code.js` (Google Apps Script). Berisi logika manipulasi Spreadsheet dan API Endpoint (menggunakan `google.script.run`).
- **Frontend (Client)**: `index.html`. Berisi UI (HTML/CSS/JS), logika pembacaan Excel (*Client-Side Parsing*), rendering tabel, dan cetak PDF.
- **Library Eksternal (CDN)**:
  - `SheetJS (XLSX)`: Untuk membaca dan mem-parsing file `.xlsx` secara lokal di browser.
  - `SweetAlert2 (Swal)`: Untuk pop-up notifikasi dan indikator *loading* interaktif.
  - `jsPDF` & `jsPDF-AutoTable`: Untuk ekspor laporan ke PDF di sisi klien.
- **Styling**: Vanilla CSS dengan tema *Dark Mode Glassmorphism*. Selalu gunakan CSS Variables yang sudah ada di dalam tag `<style>` (misal: `var(--bg-glass)`, `var(--accent-1)`).

---

## ⚠️ 2. Aturan Kritis (CRITICAL RULES) - Wajib Dipatuhi!

### ❌ A. Dilarang Menggunakan `window.location.reload()`
Google Apps Script Web App berjalan di dalam `<iframe>` (sandbox) yang sangat ketat. Memanggil `location.reload()` akan menyebabkan halaman menjadi **blank white screen (kosong)**.
- **Solusi**: Lakukan *Dynamic DOM Update*. Jika butuh memuat ulang data setelah operasi backend selesai, panggil kembali API backend (misal: `google.script.run.withSuccessHandler(...).getDashboardData()`) dan perbarui UI dengan JavaScript murni.

### ❌ B. Dilarang Memanggil `ui.alert()` Sembarangan di Backend
Fungsi yang dieksekusi dari Web App berjalan secara *headless*. Memanggil `SpreadsheetApp.getUi().alert()` akan memicu error `TypeError: Cannot read properties of null (reading 'alert')`.
- **Solusi**: Gunakan *wrapper* `_alert(msg, isSuccess)` yang sudah disediakan di `code.js`. Wrapper ini otomatis akan mengabaikan pemanggilan UI jika dijalankan dari Web App, dan akan melempar pesan *error* murni yang bisa ditangkap oleh `withFailureHandler` di frontend.

### ✅ C. Wajib Menggunakan "Chunking" untuk Upload Data
Membaca file Excel yang berisi ribuan baris langsung di backend akan terkena limitasi batas waktu (*Timeout 6 menit*) GAS.
- **Solusi**: File Excel wajib di-parse di *frontend* menggunakan SheetJS, lalu dikirim ke backend (`uploadLaporanChunk`) dalam pecahan array (*chunks*), maksimal 500 baris per kirim. Setelah *chunk* terakhir selesai, baru jalankan `processUploadSync()`.

### ✅ D. NIP Adalah String (Teks), Bukan Angka
Google Sheets seringkali mengubah NIP (18 digit angka) menjadi format *scientific* (misal `1.98E+17`).
- **Solusi**: Selalu periksa logika penyimpanan NIP. Pastikan NIP dikonversi ke *string* atau diawali dengan tanda kutip tunggal (`'`) sebelum disimpan ke Sheet melalui fungsi `setValues()`.

---

## 📝 3. Struktur Database (Sheet Name)
Proyek ini sangat sensitif terhadap penamaan *Sheet*. Jangan asal mengubah nama *sheet* atau mereferensikan sheet yang tidak ada:
- **Sheet Mentah BKN**: `skp` (Master data), `jan`, `feb`, `mar`, `apr`, `mei`, `jun`, `jul`, `agu`, `sep`, `okt`, `nov`, `des`, `tahunan` (Data Penilaian Bulanan/Tahunan).
- **Sheet Agregasi (Dibuat otomatis oleh Script)**:
  - `pegawai`: Ringkasan seluruh nilai dari setiap bulan dan master data.
  - `pltplh`: Daftar Pejabat Pelaksana Tugas (PLT) dan Pelaksana Harian (PLH).
  - `opd`: Rekap persentase capaian per Instansi/OPD.
  - `pengecualian`: Daftar pegawai (Pensiun, Mutasi, Cuti, dll) yang tidak masuk ke penilaian dinas.

---

## 🎨 4. Panduan Ekspor PDF
- Logika pembuatan PDF ada di `index.html` (bagian bawah, `btnDownloadPdf...`).
- Saat memodifikasi tabel PDF, perhatikan *state* kolom dinamis. Misalnya, jika pengguna mem-filter 1 bulan tertentu, PDF hanya merender kolom bulan tersebut. Selalu periksa variabel filter (seperti `activeBulanVal`) sebelum merender kolom `autoTable`.
- Gunakan kode warna yang konsisten untuk *header* tabel PDF: `[15, 23, 42]` (Biru Dongker / Navy gelap khas tema aplikasi).

---

🔥 *Gunakan file panduan ini sebagai konteks utama saat melakukan refactoring, menambahkan fitur, atau memperbaiki bug pada sistem Report Kinerja. Happy Vibe Coding!*
