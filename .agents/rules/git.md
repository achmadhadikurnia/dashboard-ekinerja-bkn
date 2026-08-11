# Aturan 04: Alur Kerja Git dan Persetujuan (Git Workflow & Approvals)

Dokumen ini berisi aturan wajib bagi agen AI saat berinteraksi dengan version control (Git).

## 1. Dilarang Auto-Commit
Agen AI **DILARANG KERAS** menjalankan perintah `git commit` tanpa persetujuan eksplisit dari pengguna. Setiap perubahan kode harus dibiarkan berada pada status _working tree_ (belum di-commit) agar pengguna dapat melakukan *review* (tinjauan) terlebih dahulu.

## 2. Persetujuan Pengguna (User Review)
Setelah agen AI menyelesaikan penulisan kode, agen wajib:
- Memberitahu pengguna bahwa perubahan telah selesai ditulis ke dalam file.
- Mempersilakan pengguna untuk menguji atau me-review *diff* secara manual.
- Baru menjalankan `git commit` apabila pengguna secara tertulis menginstruksikan "silakan commit" atau perintah lain yang senada.
