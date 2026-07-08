/**
 * ==========================================
 * ALAT ADMINISTRATOR (KODE INTERNAL PENGEMBANG)
 * ==========================================
 * File ini berisi fungsi-fungsi yang hanya dijalankan langsung melalui 
 * Editor Google Apps Script (bukan dari UI) untuk keperluan pembuatan 
 * Serial Number lisensi dan proses *debugging*.
 */

/**
 * Fungsi khusus untuk Admin memproduksi Serial Number (Jalankan langsung dari Editor Script)
 */
function generateSerialNumberAdmin() {
  const tahunTarget = 2026; // Ganti tahun ini jika ingin generate untuk tahun lain
  const hash = _getHash(tahunTarget);
  const serialNumber = "EKN-" + tahunTarget + "-" + hash;

  Logger.log("====================================");
  Logger.log("SERIAL NUMBER UNTUK TAHUN " + tahunTarget);
  Logger.log(serialNumber);
  Logger.log("====================================");
}

/**
 * Fungsi untuk mendeteksi mengapa validasi gagal (Khusus Debugging)
 */
function testValidasiAdmin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPengaturan = ss.getSheetByName('pengaturan');
  
  if (!sheetPengaturan) {
    Logger.log("ERROR: Sheet dengan nama persis 'pengaturan' (huruf kecil semua) TIDAK DITEMUKAN.");
    return;
  }
  
  const snRaw = sheetPengaturan.getRange('B1').getValue().toString().trim();
  Logger.log("Isi Sel B1: '" + snRaw + "'");
  
  const snParts = snRaw.split('-');
  Logger.log("Hasil Pemisahan: " + JSON.stringify(snParts));
  
  if (snParts.length === 3 && snParts[0] === 'EKN') {
    const tahunSn = parseInt(snParts[1]);
    const hashSn = snParts[2];
    
    const hashHarapan = _getHash(tahunSn);
    Logger.log("Tahun dari SN: " + tahunSn);
    Logger.log("Hash dari SN: '" + hashSn + "'");
    Logger.log("Hash Harapan (Hitungan Script): '" + hashHarapan + "'");
    
    if (hashHarapan === hashSn) {
      Logger.log("STATUS: VALID! Lisensi berlaku untuk tahun " + tahunSn);
    } else {
      Logger.log("STATUS: TIDAK VALID! Hash tidak cocok.");
    }
  } else {
    Logger.log("STATUS: Format Serial Number Salah. Pastikan formatnya EKN-TAHUN-HASH");
  }
}
