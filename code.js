/**
 * Script Pembuatan Master Data Pegawai dari Sheet SKP
 *
 * Tahap 1: Ekstrak data dari sheet 'skp'
 * Tahap 2: Buang yang is_plt_plh != 0
 * Tahap 3: Jika ada NIP dobel (mutasi), ambil data dengan 'periode_akhir' paling baru
 * Tahap 4: Cetak ke sheet 'pegawai'
 */

// ==========================================
// PENGATURAN LISENSI APLIKASI (SERIAL NUMBER)
// ==========================================
const LICENSE_SALT = "BKN-Ekinerja-Report-AchmadHadiKurnia";

/**
 * Menghasilkan hash 8 karakter dari MD5
 */
function _getHash(tahun) {
  const raw = tahun.toString() + LICENSE_SALT;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw);
  let hexString = '';
  for (let i = 0; i < digest.length; i++) {
    let byteStr = (digest[i] & 0xFF).toString(16);
    if (byteStr.length == 1) byteStr = '0' + byteStr;
    hexString += byteStr;
  }
  return hexString.substring(0, 8).toUpperCase();
}


/**
 * Membuat pesan peringatan lisensi yang seragam
 */
function _getPesanLisensi(tahunLaporan, isHtml) {
  const intro = 'Masa berlaku lisensi (Serial Number) aplikasi ini tidak valid atau telah habis.';
  const detect = 'Aplikasi mendeteksi penggunaan data untuk laporan tahun ' + tahunLaporan + '.';
  const lock = 'Akses monitoring dasbor dan fitur penarikan data dari backend telah dikunci.';
  const contact = 'Silakan hubungi pengembang untuk mendapatkan Serial Number baru:';

  if (isHtml) {
    return intro + '<br><br>' + detect + ' ' + lock + '<br><br>' + contact +
           '<div class="contact-info">' +
             '<p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Achmad Hadi Kurnia</p>' +
             '<p><a href="mailto:imachmadhadikurnia@gmail.com" style="color: #60a5fa; text-decoration: none;">📧 imachmadhadikurnia@gmail.com</a></p>' +
             '<p><a href="https://wa.me/6287772333305" target="_blank" style="color: #4ade80; text-decoration: none;">💬 WA: +6287772333305</a></p>' +
           '</div>';
  } else {
    return intro + '\n' + detect + '\n' + lock + '\n\n' + contact + '\n\n' +
           'Achmad Hadi Kurnia\n' +
           'Email: imachmadhadikurnia@gmail.com\n' +
           'WA: +6287772333305';
  }
}

/**
 * Mengambil tahun yang valid dari Serial Number di sheet pengaturan.
 * Jika tidak valid, mengembalikan 0.
 */
function _getValidTahunLisensi() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPengaturan = ss.getSheetByName('pengaturan');

  if (!sheetPengaturan) return 0;

  const snRaw = sheetPengaturan.getRange('B1').getValue().toString().trim();
  const snParts = snRaw.split('-');

  if (snParts.length === 3 && snParts[0] === 'EKN') {
    const tahunSn = parseInt(snParts[1]);
    const hashSn = snParts[2];

    if (_getHash(tahunSn) === hashSn) {
      return tahunSn;
    }
  }

  return 0;
}


/**
 * Memeriksa apakah data laporan melebihi batas lisensi tahunan dari Serial Number
 */
function cekLisensi(sheetSkp, ui) {
  if (!sheetSkp) return true;
  let judulLaporan = sheetSkp.getRange('A1').getValue().toString().trim();
  const yearMatch = judulLaporan.match(/20\d{2}/);
  let tahunLaporan = new Date().getFullYear();

  if (yearMatch) {
    tahunLaporan = parseInt(yearMatch[0]);
  }

  const validTahunLisensi = _getValidTahunLisensi();

  // Jika tahun laporan yang sedang diproses melebihi tahun lisensi yang valid, maka tolak
  if (tahunLaporan > validTahunLisensi) {
    const msg = _getPesanLisensi(tahunLaporan, false);
    if (ui) {
      ui.alert('⚠️ Peringatan Lisensi', msg, ui.ButtonSet.OK);
    }
    return false; // Lisensi habis / tidak valid
  }

  return true; // Lisensi aman
}

function generateMasterPegawai() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch(e) {}

  const _alert = (msg, isSuccess = false) => {
    if(ui) ui.alert(msg);
    else if(!isSuccess) throw new Error(msg);
  };

  const sheetSkp = ss.getSheetByName('skp');
  const sheetPegawai = ss.getSheetByName('pegawai');

  if (!sheetSkp || !sheetPegawai) {
    _alert('Error: Pastikan sheet "skp" dan "pegawai" ada di file ini.');
    return;
  }

  // Cek Lisensi
  if (!cekLisensi(sheetSkp, ui)) return;

  // Gunakan getDisplayValues() agar NIP (18 digit) terbaca sebagai Teks murni
  // Ini mencegah NIP terpotong menjadi 1970000000000 (presisi angka Google Sheets)
  const dataSkpRaw = sheetSkp.getDataRange().getDisplayValues();

  // Fungsi pencari Header dinamis (antisipasi baris header BKN berubah)
  let barisHeaderSkp = -1;
  for (let i = 0; i < 20; i++) { // Cari di 20 baris pertama
    if (dataSkpRaw[i] && dataSkpRaw[i].indexOf('nip') !== -1) {
      barisHeaderSkp = i;
      break;
    }
  }

  if (barisHeaderSkp === -1) {
    _alert('Error: Kolom "nip" tidak ditemukan di 20 baris pertama sheet "skp".');
    return;
  }

  const headerSkp = dataSkpRaw[barisHeaderSkp];
  const idxNip = headerSkp.indexOf('nip');
  const idxIsPlt = headerSkp.indexOf('is_plt_plh');
  const idxPeriodeAkhir = headerSkp.indexOf('periode_akhir'); // Untuk menentukan jabatan terbaru

  if (idxNip === -1 || idxIsPlt === -1 || idxPeriodeAkhir === -1) {
    _alert('Error: Kolom "nip", "is_plt_plh", atau "periode_akhir" tidak ditemukan di baris header sheet "skp".');
    return;
  }

  // Objek untuk menyimpan pegawai unik (NIP sebagai kunci)
  const masterPegawaiMap = {};

  // ===============================================
  // BACA DATA PENGECUALIAN (PENSIUN/MUTASI)
  // ===============================================
  const sheetPengecualian = ss.getSheetByName('pengecualian');
  const blacklistNip = new Set();

  if (sheetPengecualian) {
    const dataPengecualian = sheetPengecualian.getDataRange().getDisplayValues();
    if (dataPengecualian.length > 0) {
      const headerPengecualian = dataPengecualian[0].map(h => h.toString().toLowerCase().trim());
      const idxNipPengecualian = headerPengecualian.indexOf('nip');

      if (idxNipPengecualian !== -1) {
        for (let i = 1; i < dataPengecualian.length; i++) {
          const nip = dataPengecualian[i][idxNipPengecualian];
          if (nip) blacklistNip.add(nip.toString().trim());
        }
      } else {
        _alert('Peringatan: Kolom "nip" tidak ditemukan di baris pertama sheet "pengecualian". Filter pengecualian tidak akan berjalan.');
      }
    }
  }

  // Looping mulai dari baris SETELAH header
  for (let i = barisHeaderSkp + 1; i < dataSkpRaw.length; i++) {
    const row = dataSkpRaw[i];
    const nipStr = row[idxNip] ? row[idxNip].toString().trim() : null;
    const isPlt = row[idxIsPlt];

    // ATURAN 1: Pastikan NIP ada dan BUKAN PLT/PLH (is_plt_plh harus 0)
    if (nipStr && (isPlt === 0 || isPlt === '0')) {

      // ATURAN 1b: Pastikan NIP tidak ada di daftar pengecualian (pensiun/mutasi)
      if (blacklistNip.has(nipStr)) {
        continue;
      }

      const tglPeriodeAkhirBaru = row[idxPeriodeAkhir] ? new Date(row[idxPeriodeAkhir]).getTime() : 0;

      // ATURAN 2: Jika NIP sudah ada di memori (kasus Mutasi / Dobel SKP)
      if (masterPegawaiMap[nipStr]) {
        const rowLama = masterPegawaiMap[nipStr];
        const tglPeriodeAkhirLama = rowLama[idxPeriodeAkhir] ? new Date(rowLama[idxPeriodeAkhir]).getTime() : 0;

        // Bandingkan tanggalnya. Jika periode_akhir yang baru dibaca LEBIH BARU, maka timpa data lama
        if (tglPeriodeAkhirBaru > tglPeriodeAkhirLama) {
          masterPegawaiMap[nipStr] = row;
        }
      } else {
        // Jika belum ada, masukkan langsung
        masterPegawaiMap[nipStr] = row;
      }
    }
  }

  // ===============================================
  // SIMPAN NILAI BULANAN LAMA AGAR TIDAK HILANG
  // ===============================================
  const daftarBulan = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'tahunan'];
  const oldBulanMap = {};

  if (sheetPegawai.getLastRow() > 1) {
    const oldData = sheetPegawai.getDataRange().getDisplayValues();
    const oldHeader = oldData[0].map(h => h.toString().toLowerCase().trim());

    let oldIdxNip = oldHeader.indexOf('nip_baru');
    if (oldIdxNip === -1) oldIdxNip = oldHeader.indexOf('nip');
    if (oldIdxNip === -1) oldIdxNip = oldHeader.indexOf('id');

    if (oldIdxNip !== -1) {
      for (let i = 1; i < oldData.length; i++) {
        const oldRow = oldData[i];
        const nipLama = oldRow[oldIdxNip] ? oldRow[oldIdxNip].toString().trim() : "";
        if (nipLama) {
          const oldScores = {};
          daftarBulan.forEach(b => {
             const idxB = oldHeader.indexOf(b);
             oldScores[b] = idxB !== -1 ? oldRow[idxB] : "";
          });
          oldBulanMap[nipLama] = oldScores;
        }
      }
    }
  }

  // Siapkan Data untuk Dicetak ke Sheet Pegawai
  const outputData = [];

  // 1. Buat Header (Copy dari header SKP, ditambah kolom Jan-Des supaya rapi)
  const headerOutput = [...headerSkp];
  daftarBulan.forEach(b => headerOutput.push(b)); // Tambahkan nama bulan di ujung kanan

  outputData.push(headerOutput);

  // 2. Masukkan semua isi data pegawai yang sudah disaring (tanpa dobel)
  const daftarNip = Object.keys(masterPegawaiMap);
  daftarNip.forEach(nip => {
    const barisPegawai = [...masterPegawaiMap[nip]]; // Copy baris asli dari skp

    // Cek apakah NIP ini punya nilai lama, jika ada gunakan, jika tidak biarkan kosong ("")
    daftarBulan.forEach(b => {
      let val = "";
      if (oldBulanMap[nip] && oldBulanMap[nip][b]) {
        val = oldBulanMap[nip][b];
      }
      barisPegawai.push(val);
    });

    outputData.push(barisPegawai);
  });

  // Tulis ke Sheet Pegawai
  sheetPegawai.clearContents(); // Hapus seluruh isi lama

  // Jika tidak ada data
  if(outputData.length <= 1) {
    _alert('Tidak ada data yang memenuhi kriteria (Semua mungkin PLT atau nip kosong).');
    return;
  }

  sheetPegawai.getRange(1, 1, outputData.length, outputData[0].length).setValues(outputData);

  // Update otomatis sheet OPD
  _generateLaporanOPD(false);

  _alert('Sukses! Ditemukan ' + (outputData.length - 1) + ' pegawai unik (tanpa PLT/PLH dan bebas duplikat mutasi). Data sudah dicetak ke sheet Pegawai & OPD.', true);
}

function hapusPengecualian() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch(e) {
    // Abaikan error jika dipanggil dari Web App context
  }

  const sheetPegawai = ss.getSheetByName('pegawai');
  const sheetPengecualian = ss.getSheetByName('pengecualian');

  if (!sheetPegawai) {
    if(ui) ui.alert('Sheet "pegawai" tidak ditemukan.');
    return { status: 'error', message: 'Sheet "pegawai" tidak ditemukan.' };
  }

  // Cek Lisensi
  const sheetSkp = ss.getSheetByName('skp');
  if (!cekLisensi(sheetSkp, ui)) return { status: 'error', message: 'Lisensi tidak valid.' };


  // 1. Ambil daftar NIP pengecualian
  const blacklistNip = new Set();
  if (sheetPengecualian) {
    const dataPengecualian = sheetPengecualian.getDataRange().getDisplayValues();
    if (dataPengecualian.length > 0) {
      const headerPengecualian = dataPengecualian[0].map(h => h.toString().toLowerCase().trim());
      const idxNipPengecualian = headerPengecualian.indexOf('nip');

      if (idxNipPengecualian !== -1) {
        for (let i = 1; i < dataPengecualian.length; i++) {
          const nip = dataPengecualian[i][idxNipPengecualian];
          if (nip) blacklistNip.add(nip.toString().trim());
        }
      }
    }
  }

  if (blacklistNip.size === 0) {
    if(ui) ui.alert('Tidak ada NIP di daftar pengecualian (atau sheet tidak ditemukan).');
    return { status: 'info', message: 'Tidak ada NIP di daftar pengecualian (atau sheet tidak ditemukan).' };
  }

  // 2. Baca sheet pegawai
  const dataPegawai = sheetPegawai.getDataRange().getValues();
  if (dataPegawai.length <= 1) return { status: 'info', message: 'Data pegawai kosong.' };

  const headerPegawai = dataPegawai[0].map(h => h.toString().trim().toLowerCase());

  let idxId = headerPegawai.indexOf('nip_baru');
  if (idxId === -1) idxId = headerPegawai.indexOf('nip');
  if (idxId === -1) idxId = headerPegawai.indexOf('id');

  if (idxId === -1) {
    if(ui) ui.alert('Kolom NIP tidak ditemukan di sheet pegawai.');
    return { status: 'error', message: 'Kolom NIP tidak ditemukan di sheet pegawai.' };
  }

  // 3. Filter data
  const outputData = [dataPegawai[0]]; // Masukkan header
  let countDihapus = 0;

  for (let i = 1; i < dataPegawai.length; i++) {
    const nip = dataPegawai[i][idxId];
    const nipStr = nip ? nip.toString().trim() : "";

    if (blacklistNip.has(nipStr)) {
      countDihapus++;
    } else {
      outputData.push(dataPegawai[i]);
    }
  }

  if (countDihapus === 0) {
    if(ui) ui.alert('Tidak ada pegawai di sheet "pegawai" yang cocok dengan daftar pengecualian.');
    return { status: 'info', message: 'Tidak ada pegawai di sheet "pegawai" yang cocok dengan daftar pengecualian.' };
  }

  // 4. Tulis ulang
  sheetPegawai.clearContents();
  sheetPegawai.getRange(1, 1, outputData.length, outputData[0].length).setValues(outputData);

  // 5. Update Rekap OPD
  _generateLaporanOPD(false);

  const finalMsg = 'Selesai! Sebanyak ' + countDihapus + ' pegawai telah dihapus dari sheet "pegawai". Nilai bulanan tetap aman dan Rekap OPD sudah diperbarui otomatis.';
  if(ui) ui.alert(finalMsg);
  return { status: 'success', message: finalMsg };
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const menu = ui.createMenu('Generate Laporan');
  menu.addItem('1. Ambil Data Pegawai', 'generateMasterPegawai');
  menu.addSeparator();

  const subMenu = ui.createMenu('3. Ambil Nilai Kinerja');
  subMenu.addItem('Bulan Januari', 'syncJan');
  subMenu.addItem('Bulan Februari', 'syncFeb');
  subMenu.addItem('Bulan Maret', 'syncMar');
  subMenu.addItem('Bulan April', 'syncApr');
  subMenu.addItem('Bulan Mei', 'syncMei');
  subMenu.addItem('Bulan Juni', 'syncJun');
  subMenu.addItem('Bulan Juli', 'syncJul');
  subMenu.addItem('Bulan Agustus', 'syncAgu');
  subMenu.addItem('Bulan September', 'syncSep');
  subMenu.addItem('Bulan Oktober', 'syncOkt');
  subMenu.addItem('Bulan November', 'syncNov');
  subMenu.addItem('Bulan Desember', 'syncDes');
  subMenu.addItem('Tahunan', 'syncTahunan');

  subMenu.addSeparator();
  subMenu.addItem('Generate Laporan OPD', 'generateLaporanOPDManual');

  ui.createMenu('Report Kinerja')
    .addItem('1. Ambil Data Pegawai', 'generateMasterPegawai')
    .addItem('2. Hapus Pegawai Pengecualian', 'hapusPengecualian')
    .addSubMenu(subMenu)
    .addToUi();
}

// ==========================================
// FUNGSI TRIGGER UNTUK MASING-MASING BULAN
// ==========================================
function syncJan() { _updateNilaiBulan('jan'); }
function syncFeb() { _updateNilaiBulan('feb'); }
function syncMar() { _updateNilaiBulan('mar'); }
function syncApr() { _updateNilaiBulan('apr'); }
function syncMei() { _updateNilaiBulan('mei'); }
function syncJun() { _updateNilaiBulan('jun'); }
function syncJul() { _updateNilaiBulan('jul'); }
function syncAgu() { _updateNilaiBulan('agu'); }
function syncSep() { _updateNilaiBulan('sep'); }
function syncOkt() { _updateNilaiBulan('okt'); }
function syncNov() { _updateNilaiBulan('nov'); }
function syncDes() { _updateNilaiBulan('des'); }
function syncTahunan() { _updateNilaiBulan('tahunan'); }

/**
 * Menarik nilai hasil akhir HANYA dari 1 sheet bulan tertentu
 * dan menyuntikkannya ke dalam kolom bulan tersebut di sheet pegawai.
 */
function _updateNilaiBulan(targetBulan) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch(e) {}

  const _alert = (msg, isSuccess = false) => {
    if(ui) ui.alert(msg);
    else if(!isSuccess) throw new Error(msg);
  };

  const sheetPegawai = ss.getSheetByName('pegawai');
  if (!sheetPegawai) {
    _alert('Error: Sheet "pegawai" tidak ditemukan!');
    return;
  }

  // Cek Lisensi
  const sheetSkp = ss.getSheetByName('skp');
  if (!cekLisensi(sheetSkp, ui)) return;

  const sheetBulan = ss.getSheetByName(targetBulan);
  if (!sheetBulan) {
    _alert('Error: Sheet "' + targetBulan + '" tidak ditemukan atau belum ada di file ini!');
    return;
  }

  // 1. Ekstrak Data HANYA dari Bulan yang Diminta
  const mapNilai = {};
  // Gunakan getDisplayValues() agar NIP tidak diubah jadi Number oleh Google Sheets
  const dataBulanRaw = sheetBulan.getDataRange().getDisplayValues();

  // Cari baris header secara dinamis (mengantisipasi ada selisih baris kosong/tambahan teks)
  let barisHeaderBulan = -1;
  for (let i = 0; i < 20; i++) {
    if (dataBulanRaw[i] && dataBulanRaw[i].indexOf('id') !== -1 && dataBulanRaw[i].indexOf('hasil_akhir') !== -1) {
      barisHeaderBulan = i;
      break;
    }
  }

  if (barisHeaderBulan === -1) {
    _alert('Error: Kolom "id" atau "hasil_akhir" tidak ditemukan di 20 baris pertama sheet "' + targetBulan + '".');
    return;
  }

  const headerBulan = dataBulanRaw[barisHeaderBulan];
  const idxIdBulan = headerBulan.indexOf('id');
  const idxHasilAkhir = headerBulan.indexOf('hasil_akhir');

  // Looping mulai dari baris SETELAH header
  for (let i = barisHeaderBulan + 1; i < dataBulanRaw.length; i++) {
    const row = dataBulanRaw[i];
    const idStr = row[idxIdBulan] ? row[idxIdBulan].toString().trim() : null;
    let hasilAkhir = row[idxHasilAkhir] ? row[idxHasilAkhir].toString().trim() : "";

    if (hasilAkhir === "-") hasilAkhir = "";

    if (idStr) {
      mapNilai[idStr] = hasilAkhir;
    }
  }

  // 2. Baca Sheet Pegawai
  // Gunakan getDisplayValues() untuk mencocokkan format NIP yang identik
  const dataPegawai = sheetPegawai.getDataRange().getDisplayValues();
  if (dataPegawai.length <= 1) {
    _alert('Error: Sheet "pegawai" kosong. Jalankan menu ke-1 dulu.');
    return;
  }

  const headerPegawai = dataPegawai[0];
  const idxId = headerPegawai.indexOf('id');
  const posisiKolomBulan = headerPegawai.indexOf(targetBulan);

  if(idxId === -1) {
    _alert('Error: Kolom "id" tidak ditemukan di sheet pegawai.');
    return;
  }
  if (posisiKolomBulan === -1) {
    _alert('Error: Kolom "' + targetBulan + '" tidak ditemukan di sheet pegawai. Pastikan Anda sudah menjalankan menu ke-1.');
    return;
  }

  // 3. Masukkan Nilai Hanya Pada Kolom Bulan Tersebut
  let jumlahUpdate = 0;
  for (let i = 1; i < dataPegawai.length; i++) {
    const idPegawai = dataPegawai[i][idxId] ? dataPegawai[i][idxId].toString().trim() : null;

    if (idPegawai) {
      if (mapNilai[idPegawai] !== undefined && mapNilai[idPegawai] !== "") {
        dataPegawai[i][posisiKolomBulan] = mapNilai[idPegawai];
        jumlahUpdate++;
      } else {
        dataPegawai[i][posisiKolomBulan] = "";
      }
    }
  }

  // 4. Timpa Kembali ke Spreadsheet
  sheetPegawai.getRange(1, 1, dataPegawai.length, dataPegawai[0].length).setValues(dataPegawai);

  // Update otomatis sheet OPD
  _generateLaporanOPD(false);

  _alert('Berhasil! Menarik nilai kinerja bulan [' + targetBulan.toUpperCase() + '] (' + jumlahUpdate + ' pegawai lapor). Sheet OPD ikut diperbarui.', true);
}

/**
 * Tahap Terakhir: Membuat rekapitulasi jumlah pegawai dan jumlah laporan per OPD.
 * Akan membuat atau menimpa sheet "opd".
 */
function _generateLaporanOPD(showUi = true) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch(e) {}

  const _alert = (msg, isSuccess = false) => {
    if(ui && showUi) ui.alert(msg);
    else if(!isSuccess && !ui) throw new Error(msg);
  };

  const sheetPegawai = ss.getSheetByName('pegawai');
  if (!sheetPegawai) {
    _alert('Error: Sheet "pegawai" belum ada. Ekstrak data pegawai terlebih dahulu.');
    return;
  }

  // Cek Lisensi
  const sheetSkp = ss.getSheetByName('skp');
  if (!cekLisensi(sheetSkp, ui)) return;


  const dataPegawai = sheetPegawai.getDataRange().getDisplayValues();
  if (dataPegawai.length <= 1) {
    _alert('Error: Sheet "pegawai" kosong!');
    return;
  }

  const headerPegawai = dataPegawai[0];
  const idxOpd = headerPegawai.indexOf('skp_unor_induk');
  const idxStatus = headerPegawai.indexOf('skp_status');

  if (idxOpd === -1) {
    _alert('Error: Kolom "skp_unor_induk" tidak ditemukan di sheet pegawai.');
    return;
  }
  if (idxStatus === -1) {
    _alert('Error: Kolom "skp_status" tidak ditemukan di sheet pegawai.');
    return;
  }

  const daftarBulan = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'tahunan'];
  const idxBulan = {};
  daftarBulan.forEach(b => {
    idxBulan[b] = headerPegawai.indexOf(b);
  });

  // 1. Agregasi Data
  const mapOpd = {};

  for (let i = 1; i < dataPegawai.length; i++) {
    const row = dataPegawai[i];
    const namaOpd = row[idxOpd] ? row[idxOpd].toString().trim() : null;

    if (namaOpd) {
      if (!mapOpd[namaOpd]) {
        mapOpd[namaOpd] = { total: 0, skpDisetujui: 0 };
        daftarBulan.forEach(b => mapOpd[namaOpd][b] = 0);
      }

      mapOpd[namaOpd].total++;

      const statusSkp = row[idxStatus] ? row[idxStatus].toString().trim().toLowerCase() : "";
      if (statusSkp === "persetujuan") {
        mapOpd[namaOpd].skpDisetujui++;
      }

      // Cek apakah kolom bulan sudah terisi
      daftarBulan.forEach(b => {
        const pos = idxBulan[b];
        if (pos !== -1) {
          const nilaiBulan = row[pos] ? row[pos].toString().trim() : "";
          if (nilaiBulan !== "") {
            mapOpd[namaOpd][b]++;
          }
        }
      });
    }
  }

  // 2. Siapkan Output
  const outputData = [];
  const headerOpd = ['No.', 'OPD', 'Total Pegawai', 'SKP Disetujui'];
  const namaBulanBagus = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Tahunan'];
  namaBulanBagus.forEach(b => headerOpd.push(b));

  outputData.push(headerOpd);

  const daftarNamaOpd = Object.keys(mapOpd).sort(); // Urutkan sesuai abjad

  let no = 1;
  let grandTotalPegawai = 0;
  let grandTotalDisetujui = 0;
  const grandTotalBulan = {};
  daftarBulan.forEach(b => grandTotalBulan[b] = 0);

  daftarNamaOpd.forEach(opd => {
    grandTotalPegawai += mapOpd[opd].total;
    grandTotalDisetujui += mapOpd[opd].skpDisetujui;

    const rowOutput = [no++, opd, mapOpd[opd].total, mapOpd[opd].skpDisetujui];
    daftarBulan.forEach(b => {
      rowOutput.push(mapOpd[opd][b]);
      grandTotalBulan[b] += mapOpd[opd][b];
    });
    outputData.push(rowOutput);
  });

  // Tambahkan Baris "JUMLAH TOTAL"
  const rowTotal = ["", "JUMLAH TOTAL", grandTotalPegawai, grandTotalDisetujui];
  daftarBulan.forEach(b => {
    rowTotal.push(grandTotalBulan[b]);
  });
  outputData.push(rowTotal);

  // 3. Tulis ke Sheet OPD
  let sheetOpd = ss.getSheetByName('opd');
  if (!sheetOpd) {
    sheetOpd = ss.insertSheet('opd');
  } else {
    sheetOpd.clearContents();
  }

  if (outputData.length > 1) {
    sheetOpd.getRange(1, 1, outputData.length, outputData[0].length).setValues(outputData);
  }

  _alert('Berhasil! Sheet "opd" telah diperbarui dengan rekapitulasi data dari ' + daftarNamaOpd.length + ' Instansi/OPD.', true);
}

// ==========================================
// APLIKASI WEB (DASHBOARD UI)
// ==========================================

/**
 * Fungsi ini dijalankan ketika URL Web App dibuka.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Dashboard Laporan Kinerja')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Fungsi untuk dipanggil dari Frontend UI guna mengambil data OPD terbaru.
 */
function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetOpd = ss.getSheetByName('opd');

  const rows = [];
  let grandTotalRow = null;

  if (sheetOpd) {
    const data = sheetOpd.getDataRange().getDisplayValues();
    if (data.length > 1) {
      // Baca semua baris kecuali header
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === "JUMLAH TOTAL") {
          grandTotalRow = row;
          continue;
        }

        // Parse angka agar jadi Number bukan String
        rows.push({
          opd: row[1],
          totalPegawai: parseInt(row[2].toString().replace(/\D/g, '')) || 0,
          skpDisetujui: parseInt(row[3].toString().replace(/\D/g, '')) || 0,
          bulanan: [
            parseInt(row[4]?.toString().replace(/\D/g, '')) || 0, // Jan
            parseInt(row[5]?.toString().replace(/\D/g, '')) || 0, // Feb
            parseInt(row[6]?.toString().replace(/\D/g, '')) || 0, // Mar
            parseInt(row[7]?.toString().replace(/\D/g, '')) || 0, // Apr
            parseInt(row[8]?.toString().replace(/\D/g, '')) || 0, // Mei
            parseInt(row[9]?.toString().replace(/\D/g, '')) || 0, // Jun
            parseInt(row[10]?.toString().replace(/\D/g, '')) || 0, // Jul
            parseInt(row[11]?.toString().replace(/\D/g, '')) || 0, // Agu
            parseInt(row[12]?.toString().replace(/\D/g, '')) || 0, // Sep
            parseInt(row[13]?.toString().replace(/\D/g, '')) || 0, // Okt
            parseInt(row[14]?.toString().replace(/\D/g, '')) || 0, // Nov
            parseInt(row[15]?.toString().replace(/\D/g, '')) || 0, // Des
            parseInt(row[16]?.toString().replace(/\D/g, '')) || 0  // Tahunan
          ]
        });
      }
    }
  }

  // Siapkan data Grand Total
  const grandTotal = {
    totalPegawai: grandTotalRow ? parseInt(grandTotalRow[2].toString().replace(/\D/g, '')) || 0 : 0,
    skpDisetujui: grandTotalRow ? parseInt(grandTotalRow[3].toString().replace(/\D/g, '')) || 0 : 0,
    bulanan: []
  };

  if (grandTotalRow) {
    for (let m = 4; m <= 16; m++) {
      grandTotal.bulanan.push(parseInt(grandTotalRow[m]?.toString().replace(/\D/g, '')) || 0);
    }
  } else {
    grandTotal.bulanan = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  }



  // BACA DATA DINAMIS TREN NILAI DARI SHEET PEGAWAI
  const sheetPegawai = ss.getSheetByName('pegawai');
  let trenNilai = {};
  
  if (sheetPegawai) {
    const rawPegawai = sheetPegawai.getDataRange().getDisplayValues();
    if (rawPegawai.length > 1) {
      const headerPegawai = rawPegawai[0].map(h => h.toString().toLowerCase().trim());
      const daftarBulanStr = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'tahunan'];
      const idxBulanArr = daftarBulanStr.map(b => headerPegawai.indexOf(b));
      
      for (let i = 1; i < rawPegawai.length; i++) {
        const row = rawPegawai[i];
        idxBulanArr.forEach((idxB, monthIndex) => {
          if (idxB !== -1) {
            let val = row[idxB] ? row[idxB].toString().trim() : "";
            if (val !== "" && val !== "-") {
              // Title Case standardisation
              val = val.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
              
              if (!trenNilai[val]) {
                trenNilai[val] = [0,0,0,0,0,0,0,0,0,0,0,0,0];
              }
              trenNilai[val][monthIndex]++;
            }
          }
        });
      }
    }
  }
  grandTotal.trenNilai = trenNilai;

  // Data pegawai (seluruh row) tidak ditarik di sini agar Dashboard muncul instan (Lazy Loading)
  // ===============================================
  // BACA WAKTU UPDATE (SEL A6) DARI MASING-MASING SHEET
  // ===============================================
  const timestamps = [];
  const daftarBulanStr = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'tahunan'];

  daftarBulanStr.forEach(b => {
    const s = ss.getSheetByName(b);
    if (s) {
      const a6 = s.getRange("A6").getDisplayValue().trim();
      timestamps.push(a6);
    } else {
      timestamps.push("");
    }
  });

  // ===============================================
  // BACA METADATA DARI SHEET SKP (A1: Judul, A2: Instansi)
  // ===============================================
  let reportTitle = "Ekinerja BKN";
  let reportInstansi = "";
  let licenseWarning = "";
  const sheetSkp = ss.getSheetByName('skp');

  if (sheetSkp) {
    const a1 = sheetSkp.getRange("A1").getDisplayValue().trim();
    if (a1) reportTitle = a1;

    let a2 = sheetSkp.getRange("A2").getDisplayValue().trim();
    if (a2.toLowerCase().startsWith("instansi ")) {
      a2 = a2.substring(9).trim();
    }
    reportInstansi = a2;

    // Pengecekan Lisensi untuk ditampilkan di Dashboard
    const yearMatch = reportTitle.match(/20\d{2}/);
    let tahunLaporan = new Date().getFullYear();
    if (yearMatch) {
      tahunLaporan = parseInt(yearMatch[0]);
    }

    const validTahunLisensi = _getValidTahunLisensi();
    if (tahunLaporan > validTahunLisensi) {
      licenseWarning = _getPesanLisensi(tahunLaporan, true);
    }
  }

  return {
    status: 'success',
    data: {
      opdData: rows,
      grandTotal: grandTotal,
      timestamps: timestamps,
      metadata: {
        title: reportTitle,
        instansi: reportInstansi,
        licenseWarning: licenseWarning
      }
    }
  };
}

/**
 * Fungsi khusus untuk menarik data Pegawai secara terpisah (Lazy Loading)
 * Dipanggil dari Frontend UI di latar belakang.
 */
function getPegawaiData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPegawai = ss.getSheetByName('pegawai');
  
  if (!sheetPegawai) {
    return { status: 'error', message: 'Sheet "pegawai" belum ada.' };
  }

  // Cek lisensi agar API ini juga terlindungi
  const sheetSkp = ss.getSheetByName('skp');
  if (sheetSkp) {
    const judulLaporan = sheetSkp.getRange('A1').getValue().toString().trim();
    const yearMatch = judulLaporan.match(/20\d{2}/);
    let tahunLaporan = new Date().getFullYear();
    if (yearMatch) tahunLaporan = parseInt(yearMatch[0]);
    
    if (tahunLaporan > _getValidTahunLisensi()) {
      return { status: 'error', message: 'Masa lisensi berakhir.' };
    }
  }

  let pegawaiData = [];
  const rawPegawai = sheetPegawai.getDataRange().getDisplayValues();
  if (rawPegawai.length > 1) {
    const headerPegawai = rawPegawai[0];
    const idxNip = headerPegawai.indexOf('nip');
    const idxNama = headerPegawai.indexOf('nama');

    // Deteksi dinamis untuk nama kolom jabatan
    let idxJabatan = headerPegawai.indexOf('jabatan');
    if (idxJabatan === -1) idxJabatan = headerPegawai.indexOf('skp_jabatan');
    if (idxJabatan === -1) idxJabatan = headerPegawai.indexOf('jabatan_akhir');
    if (idxJabatan === -1) idxJabatan = headerPegawai.indexOf('nama_jabatan');

    // Deteksi dinamis untuk unit kerja
    let idxUnitKerja = headerPegawai.indexOf('unit_kerja');
    if (idxUnitKerja === -1) idxUnitKerja = headerPegawai.indexOf('skp_unor');
    if (idxUnitKerja === -1) idxUnitKerja = headerPegawai.indexOf('skp_unor_nama');
    if (idxUnitKerja === -1) idxUnitKerja = headerPegawai.indexOf('unor_nama');

    let idxOpd = headerPegawai.indexOf('skp_unor_induk');
    let idxSkpStatus = headerPegawai.indexOf('skp_status');

    const daftarBulan = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des', 'tahunan'];
    const idxBulanPegawai = {};
    daftarBulan.forEach(b => {
      idxBulanPegawai[b] = headerPegawai.indexOf(b);
    });

    if (idxNip !== -1 && idxNama !== -1) {
      for (let i = 1; i < rawPegawai.length; i++) {
        const pRow = rawPegawai[i];
        const bData = [];

        daftarBulan.forEach(b => {
           const realVal = idxBulanPegawai[b] !== -1 ? pRow[idxBulanPegawai[b]].toString().trim() : "";
           bData.push(realVal);
        });

        pegawaiData.push({
          nip: pRow[idxNip] ? pRow[idxNip].toString().trim() : "",
          nama: pRow[idxNama] ? pRow[idxNama].toString().trim() : "",
          jabatan: idxJabatan !== -1 && pRow[idxJabatan] ? pRow[idxJabatan].toString().trim() : "-",
          unit_kerja: idxUnitKerja !== -1 && pRow[idxUnitKerja] ? pRow[idxUnitKerja].toString().trim() : "-",
          opd: idxOpd !== -1 && pRow[idxOpd] ? pRow[idxOpd].toString().trim() : "-",
          skp_status: idxSkpStatus !== -1 && pRow[idxSkpStatus] ? pRow[idxSkpStatus].toString().trim() : "-",
          bulanan: bData
        });
      }
    }
  }

  return {
    status: 'success',
    data: pegawaiData
  };
}

// ==========================================
// PENGECUALIAN CRUD
// ==========================================

function getPengecualianData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Pengecualian');
  if (!sheet) return { status: 'error', message: 'Sheet Pengecualian tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'success', data: [] };
  
  const headers = data[0].map(h => h.toString().toLowerCase().trim().replace(/\./g, ''));
  const idxNip = headers.indexOf('nip');
  const idxNama = headers.indexOf('nama');
  const idxJab = headers.indexOf('jabatan');
  const idxUnit = headers.indexOf('unit kerja');
  const idxOpd = headers.indexOf('opd');
  const idxKet = headers.indexOf('keterangan');
  
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (idxNip !== -1 && row[idxNip]) {
      result.push({
        nip: row[idxNip].toString().trim(),
        nama: idxNama !== -1 ? row[idxNama].toString().trim() : '',
        jabatan: idxJab !== -1 ? row[idxJab].toString().trim() : '',
        unit_kerja: idxUnit !== -1 ? row[idxUnit].toString().trim() : '',
        opd: idxOpd !== -1 ? row[idxOpd].toString().trim() : '',
        keterangan: idxKet !== -1 ? row[idxKet].toString().trim() : ''
      });
    }
  }
  return { status: 'success', data: result };
}

function savePengecualianData(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Pengecualian');
  if (!sheet) return { status: 'error', message: 'Sheet Pengecualian tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data.length > 0 ? data[0].map(h => h.toString().toLowerCase().trim().replace(/\./g, '')) : [];
  
  const idxNip = headers.indexOf('nip');
  if(idxNip === -1) return { status: 'error', message: 'Kolom NIP tidak ditemukan di sheet Pengecualian' };
  
  // Update if exists
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idxNip] && data[i][idxNip].toString().trim() === payload.nip) {
      foundRow = i + 1;
      break;
    }
  }
  
  const idxNama = headers.indexOf('nama');
  const idxJab = headers.indexOf('jabatan');
  const idxUnit = headers.indexOf('unit kerja');
  const idxOpd = headers.indexOf('opd');
  const idxKet = headers.indexOf('keterangan');
  
  if (foundRow !== -1) {
    if (idxNama !== -1) sheet.getRange(foundRow, idxNama + 1).setValue(payload.nama);
    if (idxJab !== -1) sheet.getRange(foundRow, idxJab + 1).setValue(payload.jabatan);
    if (idxUnit !== -1) sheet.getRange(foundRow, idxUnit + 1).setValue(payload.unit_kerja);
    if (idxOpd !== -1) sheet.getRange(foundRow, idxOpd + 1).setValue(payload.opd);
    if (idxKet !== -1) sheet.getRange(foundRow, idxKet + 1).setValue(payload.keterangan);
    return { status: 'success', message: 'Data pengecualian berhasil diperbarui' };
  } else {
    // Insert new
    const newRow = new Array(headers.length).fill('');
    const idxNo = headers.indexOf('no');
    if(idxNo !== -1) newRow[idxNo] = data.length; // No (data.length - 1 + 1)
    newRow[idxNip] = payload.nip;
    if (idxNama !== -1) newRow[idxNama] = payload.nama;
    if (idxJab !== -1) newRow[idxJab] = payload.jabatan;
    if (idxUnit !== -1) newRow[idxUnit] = payload.unit_kerja;
    if (idxOpd !== -1) newRow[idxOpd] = payload.opd;
    if (idxKet !== -1) newRow[idxKet] = payload.keterangan;
    sheet.appendRow(newRow);
    return { status: 'success', message: 'Data pengecualian berhasil ditambahkan' };
  }
}


function deletePengecualianData(nip) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Pengecualian');
  if (!sheet) return { status: 'error', message: 'Sheet Pengecualian tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { status: 'error', message: 'Data kosong' };
  
  const headers = data[0].map(h => h.toString().toLowerCase().trim().replace(/\./g, ''));
  const idxNip = headers.indexOf('nip');
  
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idxNip] && data[i][idxNip].toString().trim() === nip) {
      foundRow = i + 1;
      break;
    }
  }
  
  if (foundRow !== -1) {
    sheet.deleteRow(foundRow);
    
    // Renumber No
    const idxNo = headers.indexOf('no');
    if (idxNo !== -1 && sheet.getLastRow() > 1) {
      const newNoRange = sheet.getRange(2, idxNo + 1, sheet.getLastRow() - 1, 1);
      const nos = [];
      for(let i=1; i<=newNoRange.getNumRows(); i++) nos.push([i]);
      newNoRange.setValues(nos);
    }
    
    return {
      status: 'success',
      message: 'Berhasil menghapus NIP ' + nip
    };

  } else {
    return {
      status: 'error',
      message: 'NIP tidak ditemukan di daftar pengecualian'
    };
  }
}

/**
 * Mencari data pegawai langsung dari Sheet SKP berdasarkan NIP.
 * Digunakan saat input Pengecualian dan NIP tidak ditemukan di Sheet Pegawai (misal karena filter is_plt_plh dll).
 */
function getPegawaiFromSkp(nip) {
  if (!nip) return { status: 'error', message: 'NIP kosong.' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetSkp = ss.getSheetByName('skp');
  
  if (!sheetSkp) {
    return { status: 'error', message: 'Sheet "skp" tidak ditemukan.' };
  }

  const dataSkpRaw = sheetSkp.getDataRange().getDisplayValues();

  let barisHeaderSkp = -1;
  for (let i = 0; i < 20; i++) {
    if (dataSkpRaw[i] && dataSkpRaw[i].indexOf('nip') !== -1) {
      barisHeaderSkp = i;
      break;
    }
  }

  if (barisHeaderSkp === -1) {
    return { status: 'error', message: 'Kolom "nip" tidak ditemukan di sheet "skp".' };
  }

  const headerSkp = dataSkpRaw[barisHeaderSkp].map(h => h.toString().toLowerCase().trim());
  const idxNip = headerSkp.indexOf('nip');
  const idxNama = headerSkp.indexOf('nama');
  const idxPeriodeAkhir = headerSkp.indexOf('periode_akhir');

  let idxJabatan = headerSkp.indexOf('jabatan');
  if (idxJabatan === -1) idxJabatan = headerSkp.indexOf('skp_jabatan');
  if (idxJabatan === -1) idxJabatan = headerSkp.indexOf('jabatan_akhir');
  if (idxJabatan === -1) idxJabatan = headerSkp.indexOf('nama_jabatan');

  let idxUnitKerja = headerSkp.indexOf('unit_kerja');
  if (idxUnitKerja === -1) idxUnitKerja = headerSkp.indexOf('skp_unor');
  if (idxUnitKerja === -1) idxUnitKerja = headerSkp.indexOf('skp_unor_nama');
  if (idxUnitKerja === -1) idxUnitKerja = headerSkp.indexOf('unor_nama');

  let idxOpd = headerSkp.indexOf('skp_unor_induk');

  if (idxNip === -1) {
    return { status: 'error', message: 'Kolom "nip" tidak ditemukan.' };
  }

  let bestRow = null;
  let maxTime = 0;

  for (let i = barisHeaderSkp + 1; i < dataSkpRaw.length; i++) {
    const row = dataSkpRaw[i];
    const nipStr = row[idxNip] ? row[idxNip].toString().trim() : null;

    if (nipStr === nip.toString().trim()) {
      const tglPeriodeAkhir = (idxPeriodeAkhir !== -1 && row[idxPeriodeAkhir]) 
        ? new Date(row[idxPeriodeAkhir]).getTime() 
        : 0;
      
      if (!bestRow || tglPeriodeAkhir > maxTime) {
        bestRow = row;
        maxTime = tglPeriodeAkhir;
      }
    }
  }

  if (bestRow) {
    return {
      status: 'success',
      data: {
        nip: bestRow[idxNip] || '',
        nama: idxNama !== -1 ? bestRow[idxNama] : '-',
        jabatan: idxJabatan !== -1 ? bestRow[idxJabatan] : '-',
        unit_kerja: idxUnitKerja !== -1 ? bestRow[idxUnitKerja] : '-',
        opd: idxOpd !== -1 ? bestRow[idxOpd] : '-'
      }
    };
  } else {
    return {
      status: 'not_found',
      message: 'Pegawai tidak ditemukan di sheet SKP.'
    };
  }
}

// ==========================================
// FUNGSI UPLOAD LAPORAN (CHUNK)
// ==========================================

function uploadLaporanChunk(bulanId, chunkData, isFirstChunk) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(bulanId);
  
  if (!sheet) {
    sheet = ss.insertSheet(bulanId);
  }
  
  if (isFirstChunk) {
    sheet.clear();
  }
  
  if (chunkData && chunkData.length > 0) {
    const numRows = chunkData.length;
    const numCols = chunkData[0].length;
    
    const startRow = isFirstChunk ? 1 : sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, numRows, numCols).setValues(chunkData);
  }
  
  return true;
}

function processUploadSync(bulanId) {
  let msg = '';
  if (bulanId === 'skp') {
    generateMasterPegawai();
    msg = 'Berhasil memperbarui Master Pegawai.';
  } else {
    _updateNilaiBulan(bulanId);
    msg = 'Berhasil sinkronisasi nilai bulan ' + bulanId.toUpperCase() + '.';
  }
  return { status: 'success', message: msg };
}

// ==========================================
// FUNGSI LOGIN
// ==========================================
function verifyLogin(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPengaturan = ss.getSheetByName('pengaturan');
  
  if (!sheetPengaturan) {
    return { status: 'error', message: 'Sheet pengaturan tidak ditemukan!' };
  }
  
  const expectedUser = sheetPengaturan.getRange('B2').getValue().toString().trim();
  const expectedPass = sheetPengaturan.getRange('B3').getValue().toString().trim();
  
  if (username === expectedUser && password === expectedPass) {
    const token = Utilities.base64Encode(username + ':' + password);
    return { status: 'success', token: token };
  } else {
    return { status: 'error', message: 'Username atau Password salah!' };
  }
}

/**
 * Reset seluruh data database (semua sheet kecuali pengaturan)
 * Khusus sheet pengecualian, baris pertama (header) dipertahankan.
 */
function resetDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    
    if (sheetName === 'pengaturan') {
      // Abaikan sheet pengaturan
      return;
    } else if (sheetName === 'pengecualian') {
      // Khusus pengecualian, hapus data mulai dari baris ke-2 (pertahankan header)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
      }
    } else {
      // Hapus seluruh isi sheet lainnya (db_pegawai, skp, db_jan, dll)
      sheet.clearContents();
    }
  });
  
  return { status: 'success', message: 'Seluruh database telah berhasil direset!' };
}
