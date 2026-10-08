// ==========================================
// KONFIGURASI SPREADSHEET & DRIVE
// ==========================================
const SHEET_ID = '1AZ4it4n4krfZ7B3gXt8Dr04Gx9WrCSzh-TvuUA6M9po';
const FOLDER_ID = '1OnGSWbBAvFE1eA5_q8MhL3aoHbSI4LBm';
const FOLDER_DRIVE_ID = '1OnGSWbBAvFE1eA5_q8MhL3aoHbSI4LBm';
const SHEET_NAME = 'DATA';

// TOKEN BOT TELEGRAM
// Token disimpan di: Project Settings > Script Properties > nama: BOT_TOKEN
// JANGAN tulis token di kode ini.
var BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('BOT_TOKEN');

// ID GRUP TELEGRAM DITUJU UNTUK REKAP
const ID_GRUP_REKAP = "-1003912075602_25";

// ==========================================
// DATA CABANG, OPERATOR, DAN MESIN
// ==========================================
const DATA_CABANG = {
  "Benteng 1": { operator: ["Fitri", "Putri", "Nita", "Wina", "Serap"], mesin: ["KUPU", "IKAN", "TERATAI"] },
  "Benteng 2": { operator: ["Nita", "Wina", "Fitri", "Putri", "Serap"], mesin: ["KUPU", "IKAN", "TERATAI"] },
  "Mp 1": { operator: ["Weni", "Dilla", "Serap"], mesin: ["KUPU", "TERATAI", "PIALA"] },
  "Mp2": { operator: ["Fika", "Yana", "Serap"], mesin: ["KUPU", "IKAN", "PIALA"] },
  "Martubung": { operator: ["Anggi", "Ika", "Serap"], mesin: ["KUPU", "IKAN", "TERATAI"] },
  "36": { operator: ["Dewi", "Andre", "Serap"], mesin: ["KUPU", "TERATAI", "SW5", "S04"] },
  "Mapo": { operator: ["Dilla", "Melati", "Serap"], mesin: ["KUPU", "TERATAI"] },
  "Psr 9": { operator: ["Ayu", "Putri", "Serap"], mesin: ["KUPU", "IKAN"] },
  "Batangsere": { operator: ["Butet", "Yuli", "Serap"], mesin: ["KUPU"] },
  "Palumakna": { operator: ["Alex", "Nisa", "Serap"], mesin: ["KUPU"] },
  "Irex": { operator: ["Lena", "Nining", "Serap"], mesin: ["KUPU", "TERATAI"] },
  "Mail": { operator: ["Sela", "Anti", "Serap"], mesin: ["KUPU", "MERAK"] },
  "Jimi": { operator: ["Mamak", "Serap"], mesin: ["KUPU"] },
  "Bulucina": { operator: ["Mawar", "Reni", "Serap"], mesin: ["KUPU", "TERATAI"] },
  "P5": { operator: ["Rani", "Dewi", "Serap"], mesin: ["KUPU", "IKAN"] },
  "P6": { operator: ["lan", "Amoi", "Serap"], mesin: ["KUPU", "IKAN"] },
  "P7": { operator: ["Erni", "Sumik", "Serap"], mesin: ["KUPU", "IKAN"] },
  "P10": { operator: ["Yati", "Tami", "Serap"], mesin: ["KUPU", "IKAN"] },
  "Mi": { operator: ["Sri", "Vivi", "Serap"], mesin: ["KUPU", "IKAN"] },
  "Dobi 1": { operator: ["Ina", "Ayu Blw", "Tika Sp", "Ika P5", "Serap"], mesin: ["KUPU", "IKAN"] },
  "Dobi2": { operator: ["Tika Sp", "Ika P5", "Ina", "Ayu Blw", "Serap"], mesin: ["KUPU", "TERATAI"] },
  "Darmin": { operator: ["Ayu", "Aina", "Serap"], mesin: ["KUPU"] },
  "Jeman": { operator: ["Dila Kcl", "Wulan", "Serap"], mesin: ["KUPU"] },
  "Warung": { operator: ["Tika", "Sara", "Serap"], mesin: ["KUPU", "IKAN", "PIALA", "SCATTER"] },
  "Kb 1": { operator: ["Ayu Kb", "Desi", "Serap"], mesin: ["KUPU", "IKAN"] },
  "Kb 3": { operator: ["Paula", "Dea", "Serap"], mesin: ["KUPU", "IKAN"] }
};

// MAPPING ALIAS CABANG DARI KETIKAN/CAPTION OPERATOR
const MAP_CABANG_ALIAS = {
  "MP1": "Mp 1", "MP 1": "Mp 1",
  "MP2": "Mp2", "MP 2": "Mp2",
  "DOBI1": "Dobi 1", "DOBI 1": "Dobi 1",
  "DOBI2": "Dobi2", "DOBI 2": "Dobi2",
  "KB1": "Kb 1", "KB 1": "Kb 1",
  "KB3": "Kb 3", "KB 3": "Kb 3",
  "PSR9": "Psr 9", "PSR 9": "Psr 9", "PASAR9": "Psr 9", "PASAR 9": "Psr 9",
  "36": "36", "CABANG 36": "36", "CABANG36": "36", "C36": "36"
};

// ==========================================
// WEB APP ENTRY POINT
// ==========================================
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Pencatatan Mesin Per Cabang')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDataCabang() {
  const data = JSON.parse(JSON.stringify(DATA_CABANG));
  Object.keys(data).forEach(function(cabang) {
    if (data[cabang].operator && data[cabang].operator.indexOf("Serap") === -1) {
      data[cabang].operator.push("Serap");
    }
  });
  return data;
}

// ==========================================
// UTILITAS NORMALISASI & PEMBERSIH SIMBOL
// ==========================================
function normalisasi_(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
}

function upper_(v) {
  return normalisasi_(v).toUpperCase();
}

/**
 * Membersihkan simbol, tanda petik berlebih, titik, koma dari ketikan operator.
 * Contoh: "Kupu''" -> "KUPU", "Teratai.." -> "TERATAI"
 */
function bersihkanSimbolTeks_(v) {
  if (!v) return '';
  return String(v)
    .toUpperCase()
    .replace(/['"`.,!?:;=\-_+\/\\()[\]{}~@#$%^&*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalisasiFoto_(text) {
  return bersihkanSimbolTeks_(text).toLowerCase();
}

function angka_(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  var n = Number(String(v == null ? '' : v).replace(/[^0-9-]/g, ''));
  return isFinite(n) ? n : 0;
}

function formatNominalProfit_(val) {
  var nominalFormatted = Math.abs(val).toLocaleString('id-ID');
  if (val > 0) {
    return '🟢 Rp ' + nominalFormatted;
  } else if (val < 0) {
    return '🔴 -Rp ' + nominalFormatted;
  } else {
    return '⚪ Rp 0';
  }
}

function tanggalKey_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var s = normalisasi_(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s;
}

function shiftIndex_(shift) {
  var s = upper_(shift);
  if (s.indexOf('PAGI') !== -1) return 1;
  if (s.indexOf('MALAM') !== -1) return 2;
  if (s.indexOf('LONG') !== -1) return 3;
  return 0;
}

function tambahHari_(dateKey, days) {
  var d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// ==========================================
// DETEKSI CABANG & MESIN
// ==========================================
function cariCabangDariPerintah_(teks) {
  if (!teks) return null;
  var teksBersih = bersihkanSimbolTeks_(teks);
  var targetSatuKata = teksBersih.replace(/[^A-Z0-9]/g, '');
  if (!targetSatuKata) return null;

  // 1. Cek dari peta alias
  if (MAP_CABANG_ALIAS[targetSatuKata]) return MAP_CABANG_ALIAS[targetSatuKata];
  if (MAP_CABANG_ALIAS[teksBersih]) return MAP_CABANG_ALIAS[teksBersih];

  // 2. Cek dari daftar resmi DATA_CABANG
  var daftar = Object.keys(DATA_CABANG);
  for (var i = 0; i < daftar.length; i++) {
    var namaResmi = daftar[i];
    var bersihResmi = upper_(namaResmi).replace(/[^A-Z0-9]/g, '');
    if (bersihResmi === targetSatuKata) return namaResmi;
  }
  return null;
}

function deteksiShiftMesinFoto_(caption) {
  var teksBersih = bersihkanSimbolTeks_(caption);
  let shift = '';
  let mesin = '';

  if (/\bPAGI\b/.test(teksBersih)) {
    shift = 'Pagi';
  } else if (/\bMALAM\b/.test(teksBersih)) {
    shift = 'Malam';
  }

  const daftarMesin = ['KUPU', 'IKAN', 'TERATAI', 'PIALA', 'SCATTER', 'S04', 'SW5', 'MERAK'];

  for (let i = 0; i < daftarMesin.length; i++) {
    const namaMesin = daftarMesin[i];
    const pola = new RegExp('\\b' + namaMesin + '\\b', 'i');
    if (pola.test(teksBersih) || teksBersih.indexOf(namaMesin) !== -1) {
      mesin = namaMesin;
      break;
    }
  }

  return { shift: shift, mesin: mesin };
}

// ==========================================
// SHEET UTAMA & KOLOM
// ==========================================
function pastikanSheetData_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Cabang', 'Nama Mesin',
      'Key In Sekarang', 'Key Out Sekarang', 'Profit Sekarang',
      'Key In Lalu', 'Key Out Lalu', 'Profit Lalu',
      'Selisih Key In', 'Selisih Key Out', 'Net Profit Shift',
      'Operator', 'Shift', 'Tanggal Operasional', 'Foto URL', 'Catatan',
      'Modal Awal', 'Sumber Modal', 'Pengeluaran', 'Oper', 'Tempat Oper', 'Ke Modal', 'Setoran'
    ]);
  }
  return sheet;
}

function pastikanKolomOperDiData_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME) || pastikanSheetData_();
  const namaKolomBaru = ['Status Oper', 'Oper Ke', 'Nilai Oper', 'Setoran Bersih', 'Dicatat Oleh', 'Waktu Oper'];

  let lastCol = sh.getLastColumn();
  if (lastCol < 1) lastCol = 1;

  const header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const posisi = {};

  for (let i = 0; i < header.length; i++) {
    const nama = upper_(header[i]);
    if (nama) posisi[nama] = i + 1;
  }

  namaKolomBaru.forEach(function(nama) {
    const key = upper_(nama);
    if (!posisi[key]) {
      lastCol++;
      sh.getRange(1, lastCol).setValue(nama);
      posisi[key] = lastCol;
    }
  });

  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');

  return {
    sheet: sh,
    statusOper: posisi[upper_('Status Oper')],
    operKe: posisi[upper_('Oper Ke')],
    nilaiOper: posisi[upper_('Nilai Oper')],
    setoranBersih: posisi[upper_('Setoran Bersih')],
    dicatatOleh: posisi[upper_('Dicatat Oleh')],
    waktuOper: posisi[upper_('Waktu Oper')]
  };
}

function pastikanSheetOperModal_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName('OPER_MODAL');
  const headers = [
    'ID', 'Timestamp', 'Tanggal Oper', 'Shift Asal', 'Dari Cabang', 'Ke Cabang',
    'Nominal', 'Status', 'Diterima Tanggal', 'Diterima Shift', 'ID Laporan Penerima', 'Catatan',
    'Dicatat Oleh', 'Waktu Oper'
  ];

  if (!sh) {
    sh = ss.insertSheet('OPER_MODAL');
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const existing = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const posisi = {};

    for (let i = 0; i < existing.length; i++) {
      const key = upper_(existing[i]);
      if (key) posisi[key] = i + 1;
    }

    headers.forEach(function(nama) {
      const key = upper_(nama);
      if (!posisi[key]) {
        const newCol = sh.getLastColumn() + 1;
        sh.getRange(1, newCol).setValue(nama);
        posisi[key] = newCol;
      }
    });
  }

  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}

// ==========================================
// FITUR RESET MESIN
// ==========================================
function pastikanSheetResetMesin_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName('RESET_MESIN');
  const headers = ['Timestamp', 'Cabang', 'Nama Mesin', 'Diminta Oleh', 'Status'];

  if (!sh) {
    sh = ss.insertSheet('RESET_MESIN');
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function cekApakahAdminTelegram_(chatId, userId) {
  if (!chatId || !userId) return false;
  try {
    const url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/getChatMember?chat_id=' + chatId + '&user_id=' + userId;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(res.getContentText());

    if (json.ok && json.result) {
      const status = json.result.status;
      return (status === 'creator' || status === 'administrator');
    }
    return false;
  } catch (e) {
    Logger.log('Gagal cek status admin: ' + e.toString());
    return false;
  }
}

function prosesPerintahResetTelegram_(teks, namaMember, userId, chatId, timestamp) {
  if (!cekApakahAdminTelegram_(chatId, userId)) {
    return {
      ok: false,
      message: '❌ PERINTAH DITOLAK!\nPerintah /reset hanya boleh dijalankan oleh Pemilik Grup atau Admin.'
    };
  }

  const pola = /^\/reset(?:@[A-Za-z0-9_]+)?\s+(?:(.+?)\s+)?([A-Za-z0-9_]+)$/i;
  const match = String(teks || '').trim().match(pola);

  if (!match) {
    return {
      ok: false,
      message: '❌ Format salah.\n\nGunakan:\n/reset <nama_mesin>\nContoh: /reset teratai\nAtau dengan nama cabang: /reset benteng1 teratai'
    };
  }

  var inputCabang = match[1] ? match[1].trim() : '';
  var inputMesin = bersihkanSimbolTeks_(match[2]);

  var cabangTujuan = inputCabang ? cariCabangDariPerintah_(inputCabang) : null;

  const sh = pastikanSheetResetMesin_();
  sh.appendRow([timestamp, cabangTujuan || 'SEMUA_CABANG', inputMesin, namaMember, 'PERLU_RESET']);

  return {
    ok: true,
    message: '🔄 RESET MESIN BERHASIL DIDAFTARKAN!\n\n' +
             'Mesin: ' + inputMesin + '\n' +
             'Cabang: ' + (cabangTujuan || 'Sesuai Pilihan di Form') + '\n' +
             'Pemohon: ' + namaMember + '\n\n' +
             '📌 Pada pengisian form shift berikutnya, Key In & Key Out LALU mesin ini WAJIB DIISI MANUAL.'
  };
}

function cekStatusResetMesin(cabang, namaMesin) {
  try {
    const sh = pastikanSheetResetMesin_();
    const data = sh.getDataRange().getValues();
    const cTarget = upper_(cabang);
    const mTarget = bersihkanSimbolTeks_(namaMesin);

    for (let i = data.length - 1; i >= 1; i--) {
      const cCell = upper_(String(data[i][1]));
      const mCell = bersihkanSimbolTeks_(String(data[i][2]));
      const status = upper_(String(data[i][4]));

      if ((cCell === cTarget || cCell === 'SEMUA_CABANG') && mCell === mTarget && status === 'PERLU_RESET') {
        return { perluReset: true };
      }
    }
    return { perluReset: false };
  } catch (err) {
    return { perluReset: false };
  }
}

function selesaikanStatusResetMesin_(cabang, namaMesin) {
  try {
    const sh = pastikanSheetResetMesin_();
    const data = sh.getDataRange().getValues();
    const cTarget = upper_(cabang);
    const mTarget = bersihkanSimbolTeks_(namaMesin);

    for (let i = data.length - 1; i >= 1; i--) {
      const cCell = upper_(String(data[i][1]));
      const mCell = bersihkanSimbolTeks_(String(data[i][2]));
      const status = upper_(String(data[i][4]));

      if ((cCell === cTarget || cCell === 'SEMUA_CABANG') && mCell === mTarget && status === 'PERLU_RESET') {
        sh.getRange(i + 1, 5).setValue('SUDAH_DIRESET');
      }
    }
  } catch (e) {
    Logger.log('Gagal update status reset: ' + e.toString());
  }
}

// ==========================================
// CEK DUPLIKAT & URUTAN SHIFT
// ==========================================
function cekShiftSudahDiisi(cabang, tanggal, shift) {
  try {
    const sheet = pastikanSheetData_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { sudahDiisi: false };

    const data = sheet.getRange(2, 1, lastRow - 1, 24).getValues();
    const cTarget = upper_(cabang);
    const sTarget = upper_(shift);
    const tTarget = tanggalKey_(tanggal);

    for (let i = data.length - 1; i >= 0; i--) {
      if (
        upper_(String(data[i][1])) === cTarget &&
        upper_(String(data[i][13])) === sTarget &&
        tanggalKey_(data[i][14]) === tTarget
      ) {
        return { sudahDiisi: true, cabang: cabang, tanggal: tTarget, shift: shift };
      }
    }
    return { sudahDiisi: false, cabang: cabang, tanggal: tTarget, shift: shift };
  } catch (err) {
    return { error: true, message: err.toString() };
  }
}

function cekUrutanShift_(cabang, tanggal, shift) {
  const t = tanggalKey_(tanggal);
  const idx = shiftIndex_(shift);
  if (!cabang || !t || !idx) return { ok: true };

  const sheet = pastikanSheetData_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true };

  const data = sheet.getRange(2, 1, lastRow - 1, 24).getValues();
  const targetCabang = upper_(cabang);

  var laporanTerakhir = null;

  for (let i = 0; i < data.length; i++) {
    if (upper_(String(data[i][1])) !== targetCabang) continue;

    const dt = tanggalKey_(data[i][14]);
    const si = shiftIndex_(data[i][13]);
    if (!dt || !si) continue;
    if (dt > t) continue;

    const nilai = dt + '|' + si;
    if (!laporanTerakhir || nilai > laporanTerakhir.nilai) {
      laporanTerakhir = {
        tanggal: dt,
        shiftIndex: si,
        nilai: nilai,
        shift: data[i][13]
      };
    }
  }

  if (!laporanTerakhir) return { ok: true };

  const lastDate = laporanTerakhir.tanggal;
  const lastShift = laporanTerakhir.shiftIndex;

  if (t === lastDate && lastShift === 3) {
    return {
      ok: false,
      code: 'TERKUNCI',
      message: 'Tanggal ' + lastDate + ' sudah diisi SHIFT LONG (Full Day). Tidak bisa menginput shift lagi di tanggal yang sama.'
    };
  }

  if (t === lastDate && idx === lastShift) {
    return {
      ok: false,
      code: 'DUPLIKAT',
      message: 'Shift ' + shift + ' tanggal ' + t + ' sudah pernah diisi.'
    };
  }

  if (t === lastDate && idx === 3 && lastShift === 1) {
    return {
      ok: false,
      code: 'URUTAN',
      message: 'Shift Pagi tanggal ' + lastDate + ' sudah diisi. Tidak bisa memilih Shift Long lagi.'
    };
  }

  if (t === lastDate) {
    if (lastShift === 1 && idx === 2) return { ok: true };
    return {
      ok: false,
      code: 'URUTAN',
      message: 'Setelah Shift Pagi tanggal ' + lastDate + ', pilih Shift Malam.'
    };
  }

  if (t > lastDate) {
    const nextDate = tambahHari_(lastDate, 1);
    if (lastShift === 2 || lastShift === 3) {
      if (t === nextDate && (idx === 1 || idx === 3)) return { ok: true };
      return {
        ok: false,
        code: 'URUTAN',
        message: 'Laporan berikutnya wajib tanggal ' + nextDate + '.'
      };
    }

    if (lastShift === 1 && t === nextDate && (idx === 1 || idx === 3)) return { ok: true };

    return { ok: true };
  }

  return { ok: true };
}

// ==========================================
// OPER MODAL
// ==========================================
function getOperModalMenunggu(cabang, tanggal, shift) {
  try {
    const sh = pastikanSheetOperModal_();
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { ada: false, total: 0, items: [] };

    const data = sh.getRange(2, 1, lastRow - 1, 12).getValues();
    const targetCabang = upper_(cabang);
    const targetTanggal = tanggalKey_(tanggal);
    const targetShiftIndex = shiftIndex_(shift);
    const items = [];

    for (let i = 0; i < data.length; i++) {
      const status = upper_(String(data[i][7]));
      if (status !== 'MENUNGGU' && status !== 'AKTIF') continue;
      if (upper_(String(data[i][5])) !== targetCabang) continue;

      const tanggalOper = tanggalKey_(data[i][2]);
      const shiftAsal = data[i][3];
      const asalIndex = shiftIndex_(shiftAsal);

      const validUrutan =
        (tanggalOper === targetTanggal && asalIndex === 1 && targetShiftIndex === 2) ||
        (tanggalOper === tambahHari_(targetTanggal, -1) && asalIndex === 2 && targetShiftIndex === 1) ||
        (tanggalOper < targetTanggal);

      if (!validUrutan) continue;

      items.push({
        id: String(data[i][0]),
        tanggalOper: tanggalOper,
        shiftAsal: String(data[i][3]),
        dariCabang: String(data[i][4]),
        keCabang: String(data[i][5]),
        nominal: angka_(data[i][6]),
        catatan: String(data[i][11] || '')
      });
    }

    var total = items.reduce(function(sum, x) { return sum + x.nominal; }, 0);
    return { ada: items.length > 0, total: total, items: items };
  } catch (err) {
    return { error: true, message: err.toString(), ada: false, total: 0, items: [] };
  }
}

function simpanOperModal_(payload) {
  const nominal = angka_(payload.nominal);
  const dari = normalisasi_(payload.dariCabang);
  const ke = normalisasi_(payload.keCabang);
  const tanggal = tanggalKey_(payload.tanggal);
  const shift = normalisasi_(payload.shift);

  if (!nominal || nominal <= 0 || !dari || !ke || !tanggal || !shift) return null;
  if (upper_(dari) === upper_(ke)) throw new Error('Cabang tujuan oper tidak boleh sama dengan cabang pengirim.');

  const sh = pastikanSheetOperModal_();
  const id = 'OP-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 10000);

  sh.appendRow([
    id, new Date(), tanggal, shift, dari, ke, nominal, 'MENUNGGU', '', '', '', normalisasi_(payload.catatan)
  ]);
  return id;
}

function tandaiOperDiterima_(ids, tanggalPenerima, shiftPenerima, laporanId) {
  if (!ids || !ids.length) return;
  const sh = pastikanSheetOperModal_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const idSet = {};
  ids.forEach(function(id) { idSet[String(id)] = true; });
  const range = sh.getRange(2, 1, lastRow - 1, 12);
  const data = range.getValues();

  for (let i = 0; i < data.length; i++) {
    const id = String(data[i][0]);
    if (!idSet[id]) continue;
    const statusOper = upper_(String(data[i][7]));
    if (statusOper !== 'MENUNGGU' && statusOper !== 'AKTIF') continue;
    data[i][7] = 'SUDAH DITERIMA';
    data[i][8] = tanggalKey_(tanggalPenerima);
    data[i][9] = shiftPenerima;
    data[i][10] = laporanId || '';
  }
  range.setValues(data);
}

function validasiOperMasuk_(cabang, tanggal, shift, keuangan) {
  const pending = getOperModalMenunggu(cabang, tanggal, shift);
  if (pending.error) throw new Error(pending.message);
  if (!pending.ada) return { wajib: 0, ids: [] };

  const declared = angka_(keuangan && keuangan.tambahanModalOper);
  const selisih = declared - pending.total;

  if (selisih !== 0) {
    throw new Error(
      'OPER MODAL WAJIB DIMASUKKAN.\n\n' +
      'Cabang: ' + cabang + '\n' +
      'Shift: ' + shift + '\n' +
      'Total oper yang menunggu: Rp ' + pending.total.toLocaleString('id-ID') + '\n' +
      'Tambahan modal oper yang diisi: Rp ' + declared.toLocaleString('id-ID') + '\n\n' +
      'Silakan masukkan seluruh oper modal tersebut sebagai Tambahan Modal.'
    );
  }

  return { wajib: pending.total, ids: pending.items.map(function(x) { return x.id; }) };
}

function cekKetersediaanShift(cabang, tanggal, shift) {
  try {
    const duplikat = cekShiftSudahDiisi(cabang, tanggal, shift);
    if (duplikat.error) return { boleh: false, pesan: duplikat.message };
    if (duplikat.sudahDiisi) {
      return {
        boleh: false,
        pesan: 'Shift ' + shift + ' untuk ' + cabang + ' tanggal ' + tanggalKey_(tanggal) + ' sudah pernah diisi.'
      };
    }

    const urutan = cekUrutanShift_(cabang, tanggal, shift);
    if (!urutan.ok) return { boleh: false, pesan: urutan.message };

    const pending = getOperModalMenunggu(cabang, tanggal, shift);
    if (pending && pending.error) return { boleh: false, pesan: pending.message };

    return {
      boleh: true,
      pesan: pending && pending.ada
        ? 'Shift tersedia. Ada oper modal masuk Rp ' + pending.total.toLocaleString('id-ID') + ' yang wajib dimasukkan.'
        : 'Tanggal dan shift ini masih bisa diisi.',
      operMasuk: pending && pending.ada ? pending.total : 0
    };
  } catch (err) {
    return { boleh: false, pesan: err.toString() };
  }
}

// ==========================================
// REKAP TELEGRAM AUTOMATION
// ==========================================
function getRekapPengisianShift_(tanggal, shift) {
  const sheet = pastikanSheetData_();
  const lastRow = sheet.getLastRow();
  const tTarget = tanggalKey_(tanggal);
  const sTarget = upper_(shift);
  
  const semuaCabang = Object.keys(DATA_CABANG);
  const sudahIsi = [];
  const belumIsi = [];

  if (lastRow < 2) {
    return {
      sudahIsi: [],
      belumIsi: semuaCabang,
      totalSudah: 0,
      totalBelum: semuaCabang.length
    };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 24).getValues();
  const cabangSudahMap = {};

  for (let i = 0; i < data.length; i++) {
    const cName = String(data[i][1] || '').trim();
    const sName = upper_(String(data[i][13] || ''));
    const tName = tanggalKey_(data[i][14]);
    const opName = String(data[i][12] || '').trim();
    const netProfit = angka_(data[i][11]);

    if (tName === tTarget && sName === sTarget && cName) {
      if (!cabangSudahMap[cName]) {
        cabangSudahMap[cName] = {
          operator: opName,
          totalProfit: netProfit,
          mesin: []
        };
      } else {
        cabangSudahMap[cName].totalProfit += netProfit;
      }

      var namaMesin = String(data[i][2] || '').trim();
      if (namaMesin) {
        cabangSudahMap[cName].mesin.push({
          namaMesin: namaMesin,
          profit: netProfit
        });
      }
    }
  }

  semuaCabang.forEach(function(cabang) {
    if (cabangSudahMap[cabang]) {
      sudahIsi.push({
        cabang: cabang,
        operator: cabangSudahMap[cabang].operator,
        totalProfit: cabangSudahMap[cabang].totalProfit,
        mesin: cabangSudahMap[cabang].mesin
      });
    } else {
      belumIsi.push(cabang);
    }
  });

  return {
    sudahIsi: sudahIsi,
    belumIsi: belumIsi,
    totalSudah: sudahIsi.length,
    totalBelum: belumIsi.length
  };
}

function kirimLaporanRekapKeGrup(tanggal, shift, cabangBaru, operatorBaru) {
  const rekap = getRekapPengisianShift_(tanggal, shift);

  let msg = "📊 *REKAP PENGISIAN LAPORAN SHIFT*\n";
  msg += "📅 *Tanggal:* " + tanggalKey_(tanggal) + "\n";
  msg += "⏰ *Shift:* " + shift + "\n";
  msg += "-----------------------------------\n\n";

  msg += "✅ *SUDAH ISI (" + rekap.totalSudah + "/" + (rekap.totalSudah + rekap.totalBelum) + "):*\n";
  if (rekap.sudahIsi.length > 0) {
    rekap.sudahIsi.forEach(function(item, idx) {
      msg += (idx + 1) + ". *" + item.cabang + "* (" + item.operator + ")\n";
      
      if (item.mesin && item.mesin.length > 0) {
        item.mesin.forEach(function(m) {
          msg += "   • " + m.namaMesin + ": " + formatNominalProfit_(m.profit) + "\n";
        });
      }
      msg += "   👉 *Total Profit Mesin:* " + formatNominalProfit_(item.totalProfit) + "\n\n";
    });
  } else {
    msg += "_Belum ada_\n\n";
  }

  msg += "❌ *BELUM ISI (" + rekap.totalBelum + "):*\n";
  if (rekap.belumIsi.length > 0) {
    rekap.belumIsi.forEach(function(cabang, idx) {
      msg += (idx + 1) + ". " + cabang + "\n";
    });
  } else {
    msg += "🎉 *LENGKAP! Semua cabang sudah mengisi.*\n";
  }

  msg += "\n📌 _Update otomatis setelah *" + cabangBaru + "* (" + operatorBaru + ") mengisi form._";

  return kirimPesanTelegram_(ID_GRUP_REKAP, msg);
}

// ==========================================
// SIMPAN DATA FORM KE SHEET
// ==========================================
function simpanDataCabang(payload) {
  if (!payload) throw new Error('Payload kosong.');

  const cabang = normalisasi_(payload.cabang);
  const operator = normalisasi_(payload.operator);
  const shift = normalisasi_(payload.shift);
  const tglOperasional = tanggalKey_(payload.tanggalOperasional);
  const daftarMesinData = payload.dataMesin || [];
  const keuangan = payload.keuangan || {};

  if (!cabang || !DATA_CABANG[cabang]) throw new Error('Cabang tidak valid.');
  if (!operator) throw new Error('Operator wajib dipilih.');
  if (!shift) throw new Error('Shift wajib dipilih.');
  if (!tglOperasional) throw new Error('Tanggal operasional wajib diisi.');

  pastikanKolomOperDiData_();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const cek = cekShiftSudahDiisi(cabang, tglOperasional, shift);
    if (cek.error) throw new Error(cek.message);
    if (cek.sudahDiisi) throw new Error('Shift ' + shift + ' untuk ' + cabang + ' tanggal ' + tglOperasional + ' sudah pernah diisi.');

    const urutan = cekUrutanShift_(cabang, tglOperasional, shift);
    if (!urutan.ok) throw new Error(urutan.message);

    const operMasuk = validasiOperMasuk_(cabang, tglOperasional, shift, keuangan);

    const sheet = pastikanSheetData_();
    const ratio = 10;
    let totalProfitCabang = 0;
    const timestamp = new Date();
    const laporanId = 'LAP-' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 10000);

    daftarMesinData.forEach(function(m, idx) {
      let fileUrl = m.existingUrl || '';

      if (!fileUrl && m.base64) {
        const blob = base64ToBlob(m.base64, m.mimeType, m.fileName, cabang + '_' + shift + '_' + m.namaMesin);
        const file = simpanKeDrive(blob);
        fileUrl = file.getUrl();
      }

      let selisihIn = 0;
      let selisihOut = 0;
      let netProfitShift = 0;
      let profitSekarang = 0;
      const profitLalu = angka_(m.kInLalu) - angka_(m.kOutLalu);
      const kInSekarang = angka_(m.kInSekarang);
      const kOutSekarang = angka_(m.kOutSekarang);
      const kInLalu = angka_(m.kInLalu);
      const kOutLalu = angka_(m.kOutLalu);

      if (kInSekarang > 0 && kOutSekarang > 0) {
        const namaMesinUpper = bersihkanSimbolTeks_(m.namaMesin);

        if (namaMesinUpper === 'PIALA') {
          selisihIn = kInSekarang - kInLalu;
          selisihOut = kOutSekarang - kOutLalu;
          profitSekarang = kInSekarang - kOutSekarang;
          netProfitShift = (selisihIn - selisihOut) * 100;
        } else if (namaMesinUpper === 'S04') {
          selisihIn = kInLalu - kInSekarang;
          selisihOut = kOutLalu - kOutSekarang;
          profitSekarang = kInSekarang - kOutSekarang;
          netProfitShift = (selisihOut - selisihIn) * 10;
        } else if (namaMesinUpper === 'SW5' || namaMesinUpper === 'SCATTER') {
          selisihIn = kInSekarang - kInLalu;
          selisihOut = kOutSekarang - kOutLalu;
          profitSekarang = kInSekarang - kOutSekarang;
          netProfitShift = (selisihIn - selisihOut) * ratio;
        } else {
          selisihIn = kInSekarang - kInLalu;
          selisihOut = kOutSekarang - kOutLalu;
          profitSekarang = kInSekarang - kOutSekarang;
          netProfitShift = (selisihIn - selisihOut) * ratio;
        }
      } else {
        selisihIn = 0;
        selisihOut = 0;
        profitSekarang = 0;
        netProfitShift = 0;
      }

      totalProfitCabang += netProfitShift;
      const isFirstRow = (idx === 0);

      sheet.appendRow([
        timestamp,
        cabang,
        m.namaMesin,
        kInSekarang,
        kOutSekarang,
        profitSekarang,
        kInLalu,
        kOutLalu,
        profitLalu,
        selisihIn,
        selisihOut,
        netProfitShift,
        operator,
        shift,
        tglOperasional,
        fileUrl,
        payload.catatan || '',
        isFirstRow ? (keuangan.modalAwal || 0) : '',
        isFirstRow ? (keuangan.sumberModal || '') : '',
        isFirstRow ? (keuangan.pengeluaran || '') : '',
        isFirstRow ? (keuangan.oper || '') : '',
        isFirstRow ? (keuangan.tempatOper || '') : '',
        isFirstRow ? (keuangan.keModal || 0) : '',
        isFirstRow ? (keuangan.setoran || 0) : ''
      ]);

      selesaikanStatusResetMesin_(cabang, m.namaMesin);
    });

    if (!daftarMesinData.length) {
      sheet.appendRow([
        timestamp, cabang, '', 0, 0, 0, 0, 0, 0, 0, 0, 0,
        operator, shift, tglOperasional, '', payload.catatan || '',
        keuangan.modalAwal || 0, keuangan.sumberModal || '', keuangan.pengeluaran || '',
        keuangan.oper || '', keuangan.tempatOper || '', keuangan.keModal || 0, keuangan.setoran || 0
      ]);
    }

    const operKeluarNominal = angka_(keuangan.operNominal);
    const operTujuan = normalisasi_(keuangan.operTujuan || keuangan.tempatOper);
    let operKeluarId = null;

    if (operKeluarNominal > 0) {
      if (!operTujuan) throw new Error('Nominal oper diisi tetapi cabang tujuan oper belum dipilih.');
      operKeluarId = simpanOperModal_({
        nominal: operKeluarNominal,
        dariCabang: cabang,
        keCabang: operTujuan,
        tanggal: tglOperasional,
        shift: shift,
        catatan: 'Oper dari laporan ' + laporanId
      });
    }

    if (operMasuk.ids.length) {
      tandaiOperDiterima_(operMasuk.ids, tglOperasional, shift, laporanId);
    }

    if (upper_(operator) === 'SERAP') {
      simpanSerapOperator_({tanggal:tglOperasional,cabang:cabang,operator:operator,shift:shift,catatan:'Otomatis dari laporan shift ' + laporanId});
    } else {
      simpanGajiOperator_({tanggal:tglOperasional,cabang:cabang,operator:operator,shift:shift,catatan:'Otomatis dari laporan shift ' + laporanId});
    }

    const celenganList = keuangan.celenganOperator || [];
    celenganList.forEach(function(item) {
      simpanCelenganOperator_({tanggal:tglOperasional,shift:shift,cabang:cabang,operator:item.operator,nominal:item.nominal,keterangan:item.keterangan,dicatatOleh:operator});
    });

    buatDashboardPivotOtomatis();

    // OTOMATISASI REKAP LAPORAN KE GRUP TELEGRAM
    try {
      kirimLaporanRekapKeGrup(tglOperasional, shift, cabang, operator);
    } catch (eRekap) {
      Logger.log("Gagal mengirimkan rekap Telegram: " + eRekap.toString());
    }

    return {
      ok: true,
      laporanId: laporanId,
      totalProfitCabang: totalProfitCabang,
      jumlahMesin: daftarMesinData.length,
      operMasuk: operMasuk.wajib,
      operKeluarId: operKeluarId
    };
  } finally {
    lock.releaseLock();
  }
}

function getLastRecordCabang(cabang, namaMesin) {
  try {
    const sheet = pastikanSheetData_();
    const data = sheet.getDataRange().getValues();
    const cTarget = upper_(cabang);
    const mTarget = bersihkanSimbolTeks_(namaMesin);

    for (let i = data.length - 1; i >= 1; i--) {
      const cCell = upper_(String(data[i][1]));
      const mCell = bersihkanSimbolTeks_(String(data[i][2]));
      if (cCell === cTarget && mCell === mTarget) {
        return {
          keyIn: angka_(data[i][3]),
          keyOut: angka_(data[i][4])
        };
      }
    }
    return null;
  } catch (err) {
    Logger.log('Error getLastRecordCabang: ' + err.toString());
    return null;
  }
}

function cariAtauBuatSubfolder_(parent, nama) {
  const nameClean = bersihkanSimbolTeks_(nama);
  const folders = parent.getFolders();
  
  while (folders.hasNext()) {
    const folder = folders.next();
    if (bersihkanSimbolTeks_(folder.getName()) === nameClean) {
      return folder;
    }
  }
  return parent.createFolder(nama);
}

function getFotoTerbaruMesin(cabang, namaMesin) {
  try {
    var cResmi = cariCabangDariPerintah_(cabang) || cabang;
    var cBersih = bersihkanSimbolTeks_(cResmi);
    var mBersih = bersihkanSimbolTeks_(namaMesin);

    if (!cBersih || !mBersih) return { adaFoto: false, src: '', fileName: '', fileUrl: '' };

    const folderUtama = DriveApp.getFolderById(FOLDER_DRIVE_ID);
    const folderIterator = folderUtama.getFolders();
    let folderCabang = null;

    while (folderIterator.hasNext()) {
      const folder = folderIterator.next();
      if (bersihkanSimbolTeks_(folder.getName()) === cBersih) {
        folderCabang = folder;
        break;
      }
    }

    if (!folderCabang) return { adaFoto: false, src: '', fileName: '', fileUrl: '', error: 'Folder cabang tidak ditemukan' };

    const files = folderCabang.getFiles();
    let fileTerbaru = null;
    let waktuTerbaru = 0;

    while (files.hasNext()) {
      const file = files.next();
      if (!String(file.getMimeType() || '').startsWith('image/')) continue;
      
      var namaFileBersih = bersihkanSimbolTeks_(file.getName());
      if (namaFileBersih.indexOf(mBersih) === -1) continue;

      const waktu = file.getDateCreated().getTime();
      if (waktu > waktuTerbaru) {
        waktuTerbaru = waktu;
        fileTerbaru = file;
      }
    }

    if (!fileTerbaru) return { adaFoto: false, src: '', fileName: '', fileUrl: '' };

    const blob = fileTerbaru.getBlob();
    const base64 = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());

    return { adaFoto: true, src: base64, fileName: fileTerbaru.getName(), fileUrl: fileTerbaru.getUrl() };
  } catch (err) {
    return { adaFoto: false, src: '', fileName: '', fileUrl: '', error: err.toString() };
  }
}

// ==========================================
// INDEX FOTO TELEGRAM
// ==========================================
function pastikanSheetIndexFoto_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName('INDEX_FOTO');

  const headers = [
    'Timestamp', 'Nama Member', 'Group/Cabang', 'Shift', 'Mesin', 'Caption', 'Nama File', 'URL Foto'
  ];

  if (!sh) {
    sh = ss.insertSheet('INDEX_FOTO');
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  return sh;
}

function simpanIndexFotoTelegram_(timestamp, namaMember, groupCabang, shift, mesin, caption, namaFile, urlFoto) {
  try {
    const sh = pastikanSheetIndexFoto_();
    sh.appendRow([timestamp, namaMember, groupCabang, shift, mesin, caption, namaFile, urlFoto]);
  } catch (err) {
    Logger.log('Gagal simpan INDEX_FOTO: ' + err.toString());
  }
}

function cariLaporanSetoranTerakhir_(cabang) {
  const sheet = pastikanSheetData_();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return { ok: false, code: 'KOSONG', message: 'Sheet DATA belum memiliki laporan.' };
  }

  const target = upper_(cabang);
  let barisTerakhirCabang = -1;

  for (let i = data.length - 1; i >= 1; i--) {
    if (upper_(String(data[i][1])) === target) {
      barisTerakhirCabang = i;
      break;
    }
  }

  if (barisTerakhirCabang === -1) {
    return {
      ok: false,
      code: 'TIDAK_ADA_LAPORAN',
      message: 'Belum ditemukan laporan DATA untuk cabang ' + cabang + '.'
    };
  }

  const tanggalLaporan = tanggalKey_(data[barisTerakhirCabang][14]);
  const shiftLaporan = normalisasi_(data[barisTerakhirCabang][13]);

  if (!tanggalLaporan || !shiftLaporan) {
    return {
      ok: false,
      code: 'LAPORAN_TIDAK_LENGKAP',
      message: 'Laporan terbaru ' + cabang + ' tidak memiliki tanggal/shift yang valid.'
    };
  }

  const kolomOper = pastikanKolomOperDiData_();

  for (let i = data.length - 1; i >= 1; i--) {
    const cabangBaris = upper_(String(data[i][1]));
    if (cabangBaris !== target) continue;

    const tanggalBaris = tanggalKey_(data[i][14]);
    const shiftBaris = normalisasi_(data[i][13]);

    if (tanggalBaris !== tanggalLaporan || upper_(shiftBaris) !== upper_(shiftLaporan)) {
      continue;
    }

    const setoran = angka_(data[i][23]);

    if (setoran <= 0) continue;

    const statusOper = kolomOper.statusOper
      ? upper_(String(sheet.getRange(i + 1, kolomOper.statusOper).getValue()))
      : '';

    if (statusOper === 'DI-OPER' || statusOper === 'SUDAH DITERIMA') {
      return {
        ok: false,
        code: 'SUDAH_OPER',
        message: 'Setoran laporan terakhir ' + cabang + ' (' + tanggalLaporan + ' - ' + shiftLaporan + ') sudah tercatat sebagai oper modal.'
      };
    }

    return {
      ok: true,
      row: i + 1,
      tanggal: tanggalLaporan,
      shift: shiftLaporan,
      nominal: setoran,
      timestamp: data[i][0],
      statusOper: statusOper
    };
  }

  return {
    ok: false,
    code: 'TANPA_SETORAN',
    message: 'Laporan terakhir ' + cabang + ' (' + tanggalLaporan + ' - ' + shiftLaporan + ') tidak memiliki Setoran > 0.'
  };
}

function buatOperModalDariBot_(dariCabang, keCabang, namaMember, userId, timestamp) {
  if (!dariCabang || !keCabang) return { ok: false, message: 'Cabang asal dan tujuan wajib diisi.' };
  if (upper_(dariCabang) === upper_(keCabang)) return { ok: false, message: 'Cabang asal dan tujuan tidak boleh sama.' };
  if (!DATA_CABANG[dariCabang]) return { ok: false, message: 'Cabang asal tidak dikenal: ' + dariCabang };
  if (!DATA_CABANG[keCabang]) return { ok: false, message: 'Cabang tujuan tidak dikenal: ' + keCabang };

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sumber = cariLaporanSetoranTerakhir_(dariCabang);
    if (!sumber.ok) return sumber;

    const dataCols = pastikanKolomOperDiData_();
    const shData = dataCols.sheet;
    const nominal = sumber.nominal;

    const statusSekarang = dataCols.statusOper
      ? upper_(String(shData.getRange(sumber.row, dataCols.statusOper).getValue()))
      : '';

    if (statusSekarang === 'DI-OPER' || statusSekarang === 'SUDAH DITERIMA') {
      return { ok: false, code: 'SUDAH_OPER', message: 'Setoran laporan tersebut sudah pernah dioper.' };
    }

    const siapa = normalisasi_(namaMember) || ('Telegram ID ' + String(userId || ''));

    shData.getRange(sumber.row, dataCols.statusOper).setValue('DI-OPER');
    shData.getRange(sumber.row, dataCols.operKe).setValue(keCabang);
    shData.getRange(sumber.row, dataCols.nilaiOper).setValue(nominal);
    shData.getRange(sumber.row, dataCols.setoranBersih).setValue(0);
    shData.getRange(sumber.row, dataCols.dicatatOleh).setValue(siapa);
    shData.getRange(sumber.row, dataCols.waktuOper).setValue(timestamp);

    const shOper = pastikanSheetOperModal_();
    const id = 'OP-' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 10000);

    shOper.appendRow([
      id, timestamp, sumber.tanggal, sumber.shift, dariCabang, keCabang, nominal, 'AKTIF',
      '', '', '', 'OPER OTOMATIS 100% DARI SETORAN LAPORAN', siapa, timestamp
    ]);

    const namaNominal = nominal.toLocaleString('id-ID');

    return {
      ok: true,
      id: id,
      dari: dariCabang,
      ke: keCabang,
      nominal: nominal,
      tanggal: sumber.tanggal,
      shift: sumber.shift,
      dicatatOleh: siapa,
      waktu: timestamp,
      message:
        '✅ OPER MODAL BERHASIL\n\n' +
        'Dari: ' + dariCabang + '\n' +
        'Ke: ' + keCabang + '\n' +
        'Nominal: Rp ' + namaNominal + '\n' +
        'Sumber: Setoran ' + sumber.tanggal + ' - ' + sumber.shift + '\n' +
        'Dicatat oleh: ' + siapa + '\n' +
        'Waktu: ' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss') + '\n' +
        'Status: AKTIF\n\n' +
        'Setoran asli di DATA tetap Rp ' + namaNominal + '.\n' +
        'Setoran Bersih menjadi Rp 0.\n' +
        keCabang + ' akan menerima modal ini saat form dibuka.'
    };
  } finally {
    lock.releaseLock();
  }
}

function prosesPerintahOperModalTelegram_(teks, namaMember, userId, timestamp) {
  const pola = /^\/opermodal(?:@[A-Za-z0-9_]+)?\s+(.+?)\s+ke\s+(.+)$/i;
  const match = String(teks || '').trim().match(pola);

  if (!match) {
    return {
      ok: false,
      message: '❌ Format salah.\n\nGunakan:\n/opermodal benteng2 ke p5'
    };
  }

  const dariInput = normalisasi_(match[1]);
  const keInput = normalisasi_(match[2]);

  const dariCabang = cariCabangDariPerintah_(dariInput);
  const keCabang = cariCabangDariPerintah_(keInput);

  if (!dariCabang) return { ok: false, message: '❌ Cabang asal tidak ditemukan: ' + dariInput };
  if (!keCabang) return { ok: false, message: '❌ Cabang tujuan tidak ditemukan: ' + keInput };

  return buatOperModalDariBot_(dariCabang, keCabang, namaMember, userId, timestamp);
}

function kirimPesanTelegram_(chatId, message) {
  var r = panggilTelegram_('sendMessage', {
    chat_id: String(chatId),
    text: String(message || ''),
    parse_mode: 'Markdown'
  });
  if (!r.ok) {
    Logger.log('Gagal kirim pesan Telegram: ' + r.error);
    catatLogTelegram_(new Date(), 'REKAP_GAGAL', String(chatId) + ' | ' + r.error);
  }
  return r.response || '';
}

function jsonResponseTelegram_(data) {
  return ContentService.createTextOutput(JSON.stringify(data || {}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Memecah ID bergaya "-100123_25" menjadi chat_id + message_thread_id (grup forum/topik)
function pecahChatId_(raw) {
  var s = String(raw || '').trim();
  var m = s.match(/^(-?\d+)[_:](\d+)$/);
  return m ? { chat_id: m[1], message_thread_id: Number(m[2]) } : { chat_id: s };
}

function panggilTelegram_(method, payload) {
  if (!BOT_TOKEN) return { ok: false, error: 'BOT_TOKEN belum diatur di Script Properties.' };

  var tujuan = pecahChatId_(payload.chat_id);
  payload.chat_id = tujuan.chat_id;
  if (tujuan.message_thread_id && !payload.message_thread_id) {
    payload.message_thread_id = tujuan.message_thread_id;
  }

  try {
    const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/' + method, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const responseText = response.getContentText();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (err) {
      return { ok: false, error: 'Balasan Telegram bukan JSON.', response: responseText };
    }

    if (result.ok) return { ok: true, response: responseText, result: result.result };
    return {
      ok: false,
      error: result.description || ('Telegram HTTP ' + response.getResponseCode()),
      response: responseText
    };
  } catch (err) {
    return { ok: false, error: err.toString() };
  }
}

function kirimTelegramDetail_(chatId, message) {
  if (!chatId) return { ok: false, error: 'chatId kosong.' };
  if (!message) return { ok: false, error: 'Pesan kosong.' };
  return panggilTelegram_('sendMessage', { chat_id: String(chatId), text: String(message), parse_mode: 'Markdown' });
}

function uniqueStrings_(values) {
  const seen = {};
  return (values || []).map(function(value) {
    return String(value || '').trim();
  }).filter(function(value) {
    if (!value || seen[value]) return false;
    seen[value] = true;
    return true;
  });
}

function kirimAlbumTelegram_(chatId, photoUrls, caption) {
  if (!chatId) return { ok: false, error: 'chatId kosong.' };
  const urls = uniqueStrings_(photoUrls);
  if (!urls.length) return { ok: false, error: 'Tidak ada URL foto.' };

  if (urls.length === 1) {
    const payload = { chat_id: String(chatId), photo: urls[0] };
    if (caption) payload.caption = String(caption).slice(0, 1024);
    const singleResult = panggilTelegram_('sendPhoto', payload);
    return singleResult.ok
      ? { ok: true, terkirim: 1, album: [{ mulai: 1, jumlah: 1, ok: true }] }
      : singleResult;
  }

  let totalSent = 0;
  const albums = [];
  let start = 0;

  while (start < urls.length) {
    const remaining = urls.length - start;
    let size = Math.min(10, remaining);
    if (remaining - size === 1) size--;
    const part = urls.slice(start, start + size);
    const media = part.map(function(url, index) {
      const item = { type: 'photo', media: url };
      if (start === 0 && index === 0 && caption) item.caption = String(caption).slice(0, 1024);
      return item;
    });
    const result = panggilTelegram_('sendMediaGroup', { chat_id: String(chatId), media: media });

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        response: result.response || '',
        terkirim: totalSent,
        gagalMulaiDari: start + 1
      };
    }

    totalSent += part.length;
    albums.push({ mulai: start + 1, jumlah: part.length, ok: true });
    start += part.length;
    if (start < urls.length) Utilities.sleep(500);
  }

  return { ok: true, terkirim: totalSent, album: albums };
}

// ==========================================
// TELEGRAM BOT WEBHOOK
// ==========================================
function doPost(e) {
  var timestamp = new Date();
  var contents = null;

  try {
    if (!e || !e.postData || !e.postData.contents) {
      catatLogTelegram_(timestamp, 'GAGAL', 'Tidak ada data postData dari Telegram');
      return jsonResponseTelegram_({ ok: false, error: 'Tidak ada data POST.' });
    }

    contents = JSON.parse(e.postData.contents);

    if (contents.action === 'send_shift_report') {
      var shiftChatId = String(contents.chatId || contents.chat_id || '').trim();
      var shiftMessage = String(contents.message || contents.text || '');
      var shiftPhotos = Array.isArray(contents.photoUrls) ? contents.photoUrls : [];
      var shiftResult = shiftPhotos.length
        ? kirimAlbumTelegram_(shiftChatId, shiftPhotos, shiftMessage)
        : kirimTelegramDetail_(shiftChatId, shiftMessage);

      catatLogTelegram_(timestamp, shiftResult.ok ? 'SHIFT_BERHASIL' : 'SHIFT_GAGAL',
        String(contents.branch || '') + ' | ' + (shiftResult.error || 'Laporan shift terkirim.'));
      return jsonResponseTelegram_(shiftResult.ok
        ? { ok: true, type: 'send_shift_report', result: shiftResult }
        : { ok: false, error: shiftResult.error, response: shiftResult.response || '' });
    }

    if (contents.action === 'send_media_group') {
      var mediaChatId = String(contents.chatId || contents.chat_id || '').trim();
      var mediaPhotos = Array.isArray(contents.photoUrls) ? contents.photoUrls : [];
      if (!mediaPhotos.length) {
        return jsonResponseTelegram_({ ok: false, error: 'Tidak ada foto untuk dikirim.' });
      }

      var mediaResult = kirimAlbumTelegram_(mediaChatId, mediaPhotos, contents.caption || '');
      catatLogTelegram_(timestamp, mediaResult.ok ? 'UPLOAD_BERHASIL' : 'UPLOAD_GAGAL',
        String(contents.branch || '') + ' | ' + (mediaResult.error || ('Foto terkirim: ' + mediaResult.terkirim)));
      return jsonResponseTelegram_(mediaResult.ok
        ? { ok: true, type: 'send_media_group', total: uniqueStrings_(mediaPhotos).length, terkirim: mediaResult.terkirim }
        : { ok: false, error: mediaResult.error, response: mediaResult.response || '', terkirim: mediaResult.terkirim || 0 });
    }

    var msg = contents.message || contents.edited_message;

    if (!msg) {
      catatLogTelegram_(timestamp, 'DIABAIKAN', 'Event Telegram bukan berupa message');
      return jsonResponseTelegram_({ ok: true, ignored: true });
    }

    var namaGrup = msg.chat && msg.chat.title ? msg.chat.title.trim() : 'TANPA_NAMA_GRUP';

    var namaMember = '';
    if (msg.from) {
      var firstName = msg.from.first_name || '';
      var lastName = msg.from.last_name || '';
      namaMember = (firstName + ' ' + lastName).trim();
      if (!namaMember) {
        namaMember = msg.from.username ? '@' + msg.from.username : String(msg.from.id || '');
      }
    }

    var teksPesan = msg.text ? msg.text.trim() : '';

    // PERINTAH /RESET MESIN (KHUSUS ADMIN)
    if (/^\/reset(?:@[A-Za-z0-9_]+)?\b/i.test(teksPesan)) {
      var hasilReset = prosesPerintahResetTelegram_(
        teksPesan,
        namaMember,
        msg.from ? msg.from.id : '',
        msg.chat ? msg.chat.id : '',
        timestamp
      );

      if (msg.chat && msg.chat.id != null) {
        kirimPesanTelegram_(msg.chat.id, hasilReset.message);
      }

      catatLogTelegram_(timestamp, hasilReset.ok ? 'RESET_BERHASIL' : 'RESET_GAGAL', hasilReset.message);
      return HtmlService.createHtmlOutput('OK');
    }

    // PERINTAH OPERMODAL
    if (/^\/opermodal(?:@[A-Za-z0-9_]+)?\b/i.test(teksPesan)) {
      var hasilOper = prosesPerintahOperModalTelegram_(
        teksPesan,
        namaMember,
        msg.from ? msg.from.id : '',
        timestamp
      );

      if (msg.chat && msg.chat.id != null) {
        kirimPesanTelegram_(msg.chat.id, hasilOper.message);
      }

      catatLogTelegram_(timestamp, hasilOper.ok ? 'OPERMODAL_BERHASIL' : 'OPERMODAL_GAGAL', hasilOper.logDetail || hasilOper.message);
      return HtmlService.createHtmlOutput('OK');
    }

    // PESAN FOTO TELEGRAM
    var caption = msg.caption ? msg.caption.trim() : (msg.text ? msg.text.trim() : '');

    if (!msg.photo) {
      catatLogTelegram_(timestamp, 'DIABAIKAN', 'Pesan bukan foto. Chat: ' + namaGrup + ' | Teks: ' + (msg.text || ''));
      return HtmlService.createHtmlOutput('OK');
    }

    var cache = CacheService.getScriptCache();
    var msgIdKey = 'msg_' + msg.message_id;

    if (cache.get(msgIdKey)) {
      catatLogTelegram_(timestamp, 'DUPLIKAT', 'Message ID ' + msg.message_id + ' sudah diproses sebelumnya');
      return HtmlService.createHtmlOutput('OK');
    }

    cache.put(msgIdKey, 'true', 600);

    if (!caption) {
      catatLogTelegram_(timestamp, 'GAGAL_CAPTION', 'Foto diterima dari [' + namaGrup + '] tapi TANPA CAPTION');
      return HtmlService.createHtmlOutput('OK');
    }

    var infoFoto = deteksiShiftMesinFoto_(caption);
    var shiftFoto = infoFoto.shift || '';
    var mesinFoto = infoFoto.mesin || '';

    var photoArray = msg.photo;
    var fileId = photoArray[photoArray.length - 1].file_id;

    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/getFile?file_id=' + fileId);
    var fileData = JSON.parse(response.getContentText());

    if (!fileData.ok || !fileData.result) {
      catatLogTelegram_(timestamp, 'ERROR_TELEGRAM_API', 'Gagal getFile dari Telegram: ' + response.getContentText());
      return HtmlService.createHtmlOutput('OK');
    }

    var filePath = fileData.result.file_path;
    var fileUrlTelegram = 'https://api.telegram.org/file/bot' + BOT_TOKEN + '/' + filePath;
    var imageBlob = UrlFetchApp.fetch(fileUrlTelegram).getBlob();

    var today = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd_HH-mm');
    var namaFileBaru = bersihkanSimbolTeks_(namaGrup) + '_' + bersihkanSimbolTeks_(caption) + '_' + today + '.jpg';
    imageBlob.setName(namaFileBaru);

    var rootFolder = DriveApp.getFolderById(FOLDER_DRIVE_ID);
    var targetFolder = rootFolder;
    var folderStatus = 'FOLDER UTAMA (Default)';
    var cabangFoto = '';

    // DETEKSI CABANG SECARA TOLERAN TERHADAP TYPO & SPASI
    var cabangTerdeteksi = cariCabangDariPerintah_(namaGrup) || cariCabangDariPerintah_(caption);

    if (cabangTerdeteksi) {
      targetFolder = cariAtauBuatSubfolder_(rootFolder, cabangTerdeteksi);
      folderStatus = 'SUBFOLDER CABANG [' + cabangTerdeteksi + ']';
      cabangFoto = cabangTerdeteksi;
    }

    var fileBaru = targetFolder.createFile(imageBlob);
    var urlFoto = fileBaru.getUrl();

    simpanIndexFotoTelegram_(timestamp, namaMember, cabangFoto || namaGrup, shiftFoto, mesinFoto, caption, namaFileBaru, urlFoto);
    catatLogTelegram_(timestamp, 'BERHASIL', 'Foto tersimpan ke ' + folderStatus + ' | Nama File: ' + namaFileBaru);

  } catch (err) {
    catatLogTelegram_(timestamp, 'CRASH_ERROR', err.toString());
    if (contents && (contents.action === 'send_shift_report' || contents.action === 'send_media_group')) {
      return jsonResponseTelegram_({ ok: false, error: err.message || String(err) });
    }
  }

  return jsonResponseTelegram_({ ok: true });
}

function catatLogTelegram_(timestamp, status, detail) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('LOG_TELEGRAM');
    if (!sh) {
      sh = ss.insertSheet('LOG_TELEGRAM');
      sh.appendRow(['Timestamp', 'Status', 'Detail Log']);
      sh.getRange("A1:C1").setFontWeight("bold");
    }
    sh.appendRow([timestamp, status, detail]);
  } catch (e) {
    Logger.log('Gagal menulis log: ' + e.toString());
  }
}

function setWebhook() {
  var webAppUrl = 'https://script.google.com/macros/s/AKfycbwejjTAPm1nrvd10aq9KVVOO-Czf_wZnzmENXQkrBMOHZKLobxHFvUpwfv6BV4Cv8SH/exec';
  var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/setWebhook?url=' + encodeURIComponent(webAppUrl) + '&drop_pending_updates=true';
  var res = UrlFetchApp.fetch(url);
  Logger.log(res.getContentText());
}

function base64ToBlob(base64, mimeType, fileName, prefix) {
  const clean = String(base64).replace(/^data:[^;]+;base64,/, '');
  const bytes = Utilities.base64Encode(clean);
  const tz = Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  return Utilities.newBlob(bytes, mimeType || 'image/jpeg', prefix + '_' + stamp + '.jpg');
}

function simpanKeDrive(blob) {
  const root = DriveApp.getFolderById(FOLDER_ID);
  return root.createFile(blob);
}

function getModalAwalLalu(cabang) {
  try {
    const sheet = pastikanSheetData_();
    const data = sheet.getDataRange().getValues();
    const cTarget = upper_(cabang);

    for (let i = data.length - 1; i >= 1; i--) {
      const cCell = upper_(String(data[i][1]));
      if (cCell === cTarget) {
        const keModalLalu = angka_(data[i][22]);
        if (keModalLalu > 0) {
          return { ok: true, modalAwal: keModalLalu };
        }
      }
    }
    return { ok: true, modalAwal: 0 };
  } catch (err) {
    return { ok: false, modalAwal: 0 };
  }
}

// ==========================================
// BUAT TABEL PIVOT DASHBOARD OTOMATIS
// ==========================================
function buatDashboardPivotOtomatis() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const dataSheet = ss.getSheetByName('DATA');
  
  if (!dataSheet) return;

  const lastRow = dataSheet.getLastRow();
  if (lastRow < 2) return;

  const headers = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0];
  let colPengeluaranMurni = headers.indexOf('Nominal Pengeluaran Murni') + 1;

  if (colPengeluaranMurni === 0) {
    colPengeluaranMurni = dataSheet.getLastColumn() + 1;
    dataSheet.getRange(1, colPengeluaranMurni).setValue('Nominal Pengeluaran Murni');
  }

  const dataPengeluaranTeks = dataSheet.getRange(2, 20, lastRow - 1, 1).getValues();
  const arrayMurni = [];

  for (let i = 0; i < dataPengeluaranTeks.length; i++) {
    const teks = String(dataPengeluaranTeks[i][0] || '');
    let totalPengeluaranBaris = 0;

    if (teks) {
      const matches = teks.match(/\d[\d\.]*/g);
      if (matches) {
        matches.forEach(function(m) {
          const num = Number(m.replace(/\./g, ''));
          if (!isNaN(num) && num > 0) {
            totalPengeluaranBaris += num;
          }
        });
      }
    }
    arrayMurni.push([totalPengeluaranBaris]);
  }

  dataSheet.getRange(2, colPengeluaranMurni, arrayMurni.length, 1).setValues(arrayMurni);

  let dashboardSheet = ss.getSheetByName('DASHBOARD');
  if (dashboardSheet) {
    dashboardSheet.clear();
  } else {
    dashboardSheet = ss.insertSheet('DASHBOARD');
  }

  const maxCol = dataSheet.getLastColumn();
  const sourceRange = dataSheet.getRange(1, 1, lastRow, maxCol);
  const pivotTable = dashboardSheet.getRange('A1').createPivotTable(sourceRange);

  const rowCabang = pivotTable.addRowGroup(2);
  rowCabang.showTotals(true);

  const rowTanggal = pivotTable.addRowGroup(15);
  rowTanggal.showTotals(false);

  const valProfit = pivotTable.addPivotValue(12, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  valProfit.setDisplayName('Total Profit Shift');

  const valPengeluaran = pivotTable.addPivotValue(colPengeluaranMurni, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  valPengeluaran.setDisplayName('Total Pengeluaran');

  const valSetoran = pivotTable.addPivotValue(24, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
  valSetoran.setDisplayName('Total Setoran');

  dashboardSheet.getRange('B:B').setNumberFormat('yyyy-MM-dd');
  dashboardSheet.getRange('C:E').setNumberFormat('Rp #,##0');

  ss.setActiveSheet(dashboardSheet);
  ss.moveActiveSheet(1);
}

// ============================================================
// GAJI, SERAP & CELENGAN OPERATOR
// ============================================================
const SHEET_GAJIAN_OPERATOR = 'GAJIAN_OPERATOR';
const SHEET_SERAP_OPERATOR = 'SERAP_OPERATOR';
const SHEET_CELENGAN_OPERATOR = 'CELENGAN_OPERATOR';

function getTarifOperator_(cabang) {
  const tarif135 = ['JEMAN', 'BATANGSERE', 'PALUMAKNA', 'IREX'];
  return tarif135.indexOf(upper_(cabang)) !== -1 ? 135000 : 150000;
}

function getPeriodeGaji_(tanggal) {
  const d = new Date(tanggal + 'T00:00:00');
  const hari = d.getDate();
  const tz = Session.getScriptTimeZone();
  let awal, akhir, nama;
  if (hari <= 10) {
    nama = 'Periode 1'; awal = new Date(d.getFullYear(), d.getMonth(), 1); akhir = new Date(d.getFullYear(), d.getMonth(), 10);
  } else if (hari <= 20) {
    nama = 'Periode 2'; awal = new Date(d.getFullYear(), d.getMonth(), 11); akhir = new Date(d.getFullYear(), d.getMonth(), 20);
  } else {
    nama = 'Periode 3'; awal = new Date(d.getFullYear(), d.getMonth(), 21); akhir = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }
  return {periode:nama, tanggalMulai:Utilities.formatDate(awal,tz,'yyyy-MM-dd'), tanggalAkhir:Utilities.formatDate(akhir,tz,'yyyy-MM-dd')};
}

function pastikanSheetGajianOperator_() {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(SHEET_GAJIAN_OPERATOR);
  if (!sh) { sh=ss.insertSheet(SHEET_GAJIAN_OPERATOR); sh.appendRow(['Timestamp','Tanggal','Periode','Cabang','Operator','Tarif Harian','Nominal','Shift','Status','Catatan']); }
  return sh;
}

function pastikanSheetSerapOperator_() {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(SHEET_SERAP_OPERATOR);
  if (!sh) { sh=ss.insertSheet(SHEET_SERAP_OPERATOR); sh.appendRow(['Timestamp','Tanggal','Cabang','Operator','Shift','Tarif','Nominal','Status Bayar','Catatan']); }
  return sh;
}

function pastikanSheetCelenganOperator_() {
  const ss = SpreadsheetApp.openById(SHEET_ID); let sh = ss.getSheetByName(SHEET_CELENGAN_OPERATOR);
  if (!sh) { sh=ss.insertSheet(SHEET_CELENGAN_OPERATOR); sh.appendRow(['Timestamp','Tanggal','Shift','Cabang','Operator','Nominal','Keterangan','Dicatat Oleh']); }
  return sh;
}

function simpanGajiOperator_(data) {
  const tanggal = tanggalKey_(data.tanggal);
  const cabang = normalisasi_(data.cabang);
  const operator = normalisasi_(data.operator);
  const shift = normalisasi_(data.shift);
  
  if (!tanggal || !cabang || !operator) throw new Error('Data gaji operator tidak lengkap.');
  
  let tarif = getTarifOperator_(cabang);
  
  if (upper_(shift).indexOf('LONG') !== -1) {
    tarif = tarif * 2;
  }
  
  const periode = getPeriodeGaji_(tanggal);
  pastikanSheetGajianOperator_().appendRow([
    new Date(), tanggal, periode.periode, cabang, operator, tarif, tarif, shift, 'BELUM DIBAYAR', data.catatan || ''
  ]);
  
  return { ok: true, tarif: tarif, periode: periode.periode, nominal: tarif };
}

function simpanSerapOperator_(data) {
  const tanggal = tanggalKey_(data.tanggal);
  const cabang = normalisasi_(data.cabang);
  const operator = normalisasi_(data.operator);
  const shift = normalisasi_(data.shift);
  
  if (!tanggal || !cabang || !operator) throw new Error('Data SERAP operator tidak lengkap.');
  
  let tarif = getTarifOperator_(cabang);
  
  if (upper_(shift).indexOf('LONG') !== -1) {
    tarif = tarif * 2;
  }
  
  pastikanSheetSerapOperator_().appendRow([
    new Date(), tanggal, cabang, operator, shift, tarif, tarif, 'LUNAS', data.catatan || 'Dibayar setelah selesai shift'
  ]);
  
  return { ok: true, tarif: tarif, nominal: tarif, status: 'LUNAS' };
}

function perbaruiRingkasanGajiGajianOperator() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('GAJIAN_OPERATOR');
  if (!sh) return;

  const lastRow = sh.getLastRow();
  sh.getRange('L1:N100').clearContent().clearFormat();

  const headers = [['OPERATOR', 'TOTAL GAJI DIBAYAR', 'STATUS']];
  sh.getRange('L1:N1').setValues(headers)
    .setFontWeight('bold')
    .setBackground('#1e40af')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  if (lastRow < 2) return;

  const dataRange = sh.getRange(1, 1, lastRow, 10);
  const data = dataRange.getValues();
  const rekap = {};

  for (let i = 1; i < data.length; i++) {
    const operator = String(data[i][4] || '').trim();
    const nominal = Number(data[i][6] || 0);
    const status = String(data[i][8] || '').trim();

    if (!operator || status !== 'BELUM DIBAYAR') continue;

    const key = upper_(operator);
    if (!rekap[key]) {
      rekap[key] = { operator: operator, total: 0, status: 'BELUM DIBAYAR' };
    }
    rekap[key].total += nominal;
  }

  const output = [];
  Object.keys(rekap).forEach(function(k) {
    output.push([rekap[k].operator, rekap[k].total, rekap[k].status]);
  });

  if (output.length > 0) {
    sh.getRange(2, 12, output.length, 3).setValues(output);
    sh.getRange(2, 13, output.length, 1).setNumberFormat('Rp #,##0');
    sh.getRange(2, 12, output.length, 3).setBorder(true, true, true, true, true, true);
    sh.getRange(2, 14, output.length, 1).setFontColor('#dc2626').setFontWeight('bold');
  }
}

function simpanCelenganOperator_(data) {
  const tanggal=tanggalKey_(data.tanggal), cabang=normalisasi_(data.cabang), operator=normalisasi_(data.operator), nominal=angka_(data.nominal);
  if (!tanggal || !cabang || !operator) throw new Error('Data celengan operator tidak lengkap.');
  if (nominal<=0) throw new Error('Nominal celengan harus lebih dari 0.');
  pastikanSheetCelenganOperator_().appendRow([new Date(),tanggal,data.shift||'',cabang,operator,nominal,normalisasi_(data.keterangan),normalisasi_(data.dicatatOleh)]);
  return {ok:true,nominal:nominal};
}

/**
 * FUNGSI UNTUK MERAPIKAN & MENGGABUNGKAN FOLDER DUPLIKAT DI GOOGLE DRIVE
 */
function rapihkanDanGabungkanFolderDrive() {
  Logger.log('🚀 Memulai proses penggabungan folder duplikat...');
  
  var rootFolder = DriveApp.getFolderById(FOLDER_DRIVE_ID);
  var subFolders = rootFolder.getFolders();
  
  var folderUtamaMap = {};
  var daftarFolderDuplikat = [];

  while (subFolders.hasNext()) {
    var folder = subFolders.next();
    var namaFolderAsli = folder.getName();
    var cabangResmi = cariCabangDariPerintah_(namaFolderAsli);
    
    if (cabangResmi) {
      if (!folderUtamaMap[cabangResmi]) {
        folderUtamaMap[cabangResmi] = folder;
      } else {
        if (namaFolderAsli === cabangResmi) {
          daftarFolderDuplikat.push(folderUtamaMap[cabangResmi]);
          folderUtamaMap[cabangResmi] = folder;
        } else {
          daftarFolderDuplikat.push(folder);
        }
      }
    }
  }

  Logger.log('📌 Ditemukan ' + daftarFolderDuplikat.length + ' folder duplikat yang akan digabungkan.');

  var totalFileDipindahkan = 0;

  for (var i = 0; i < daftarFolderDuplikat.length; i++) {
    var folderDuplikat = daftarFolderDuplikat[i];
    var namaDuplikat = folderDuplikat.getName();
    var cabangResmi = cariCabangDariPerintah_(namaDuplikat);
    var targetFolderUtama = folderUtamaMap[cabangResmi];

    if (!targetFolderUtama || folderDuplikat.getId() === targetFolderUtama.getId()) {
      continue;
    }

    Logger.log('🔄 Memindahkan file dari folder [' + namaDuplikat + '] ke [' + targetFolderUtama.getName() + ']...');

    var files = folderDuplikat.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      file.moveTo(targetFolderUtama);
      totalFileDipindahkan++;
    }

    var innerFolders = folderDuplikat.getFolders();
    while (innerFolders.hasNext()) {
      var innerFolder = innerFolders.next();
      var targetSubFolder = cariAtauBuatSubfolder_(targetFolderUtama, innerFolder.getName());
      
      var subFiles = innerFolder.getFiles();
      while (subFiles.hasNext()) {
        var subFile = subFiles.next();
        subFile.moveTo(targetSubFolder);
        totalFileDipindahkan++;
      }
      innerFolder.setTrashed(true);
    }

    folderDuplikat.setTrashed(true);
    Logger.log('✅ Folder duplikat [' + namaDuplikat + '] selesai digabungkan dan dibersihkan.');
  }

  Logger.log('🎉 PROSES SELESAI!');
  Logger.log('📊 Total ' + totalFileDipindahkan + ' foto/file berhasil digabungkan tanpa ada yang hilang.');
}

/**
 * Fungsi utama untuk menjalankan semua unit test dari Editor Apps Script.
 * Pilih fungsi 'runAllTests' di menu dropdown atas, lalu klik 'Run'.
 */
function runAllTests() {
  Logger.log("=== MEMULAI TESTING ===");
  
  var totalTests = 0;
  var passedTests = 0;

  // Daftar fungsi test yang ingin dijalankan
  var tests = [
    testPenjumlahan,
    testFormatTanggal,
    testValidasiEmail
  ];

  tests.forEach(function(testFunc) {
    totalTests++;
    try {
      testFunc();
      passedTests++;
      Logger.log("PASSED: " + testFunc.name);
    } catch (e) {
      Logger.log("FAILED: " + testFunc.name + " -> " + e.message);
    }
  });

  Logger.log("=== HASIL TESTING ===");
  Logger.log("Total: " + totalTests + " | Lolos: " + passedTests + " | Gagal: " + (totalTests - passedTests));
}

/**
 * Helper Assert sederhana untuk memeriksa kondisi
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || ("Ekspektasi: " + expected + ", tapi mendapatkan: " + actual));
  }
}

// ==========================================
// CONTOH UNIT TEST
// ==========================================

function testPenjumlahan() {
  var hasil = 2 + 3;
  assertEqual(hasil, 5, "Fungsi penjumlahan harusnya menghasilkan 5");
}

function testFormatTanggal() {
  var d = new Date("2026-10-06");
  assertEqual(d.getFullYear(), 2026, "Tahun harus 2026");
}

function testValidasiEmail() {
  var email = "test@example.com";
  var isValid = email.includes("@");
  assertEqual(isValid, true, "Email harus mengandung karakter @");
}


function testKirimFotoTelegram() {
  // 1. Masukkan Token Bot Telegram & Chat ID Group kamu
  const TELEGRAM_TOKEN = "BOT_TOKEN_KAMU"; 
  const CHAT_ID = "CHAT_ID_GRUP_KAMU"; // Contoh: "-1001234567890"

  // 2. Masukkan Public URL Foto dari Supabase
  const SUPABASE_PHOTO_URL = "URL_PUBLIC_FOTO_SUPABASE_KAMU";

  // Endpoint Telegram API
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;

  const payload = {
    chat_id: CHAT_ID,
    photo: SUPABASE_PHOTO_URL,
    caption: "🧪 Test kirim foto dari GAS Editor"
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Supaya kalau error, detail response-nya tetap kelihatan
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseText = response.getContentText();
    
    Logger.log("=== STATUS CODE ===");
    Logger.log(response.getResponseCode());
    
    Logger.log("=== RESPONSE TELEGRAM ===");
    Logger.log(responseText);

  } catch (error) {
    Logger.log("=== ERROR EXECUTION ===");
    Logger.log(error.toString());
  }
}

/**
 * Fungsi utama yang ingin diuji (contoh)
 */
function simpanData(cabang, mesin, angka) {
  Logger.log("Menerima data -> Cabang: " + cabang + ", Mesin: " + mesin + ", Angka: " + angka);
  
  // Logika simpan data Anda di sini...
  if (!cabang || !mesin) {
    throw new Error("Data tidak lengkap!");
  }
  
  return "Berhasil disimpan";
}

/**
 * FUNGSI TES (Run fungsi ini di Editor)
 */
function tesSimpanData() {
  try {
    // 1. Siapkan data uji coba
    var sampelCabang = "KUPU";
    var sampelMesin = "Mesin A";
    var sampelAngka = 1250;

    Logger.log("--- MULAI PENGUJIAN ---");

    // 2. Panggil fungsi yang ingin diuji
    var hasil = simpanData(sampelCabang, sampelMesin, sampelAngka);

    // 3. Tampilkan hasil di Logger
    Logger.log("Hasil Output: " + hasil);
    Logger.log("--- PENGUJIAN SELESAI (SUKSES) ---");

  } catch (error) {
    Logger.log("--- PENGUJIAN GAGAL ---");
    Logger.log("Error: " + error.message);
  }
}

function cetakScriptProperties() {
  var props = PropertiesService.getScriptProperties().getProperties();
  Object.keys(props).forEach(function(k) {
    if (/TOKEN|SECRET|KEY|PASSWORD/i.test(k)) props[k] = '***disembunyikan***';
  });
  Logger.log(JSON.stringify(props, null, 2));
}

/**
 * CEK SEMUA GRUP: menguji setiap Script Property yang isinya berupa ID chat Telegram.
 * Jalankan dari editor, lihat hasil di Execution log. Tiap grup menerima 1 pesan tes.
 */
function cekSemuaGrupDiProperties() {
  var props = PropertiesService.getScriptProperties().getProperties();
  Object.keys(props).forEach(function(nama) {
    if (nama === 'BOT_TOKEN') return;
    var nilai = props[nama];
    if (!/^\s*-?\d+([_:]\d+)?\s*$/.test(nilai)) {
      Logger.log(nama + ' | dilewati (bukan format ID chat): "' + nilai + '"');
      return;
    }
    var t = pecahChatId_(nilai);
    var payload = { chat_id: t.chat_id, text: '✅ Tes koneksi bot: ' + nama };
    if (t.message_thread_id) payload.message_thread_id = t.message_thread_id;
    var info = panggilTelegram_('getChat', { chat_id: t.chat_id });
    var tes = panggilTelegram_('sendMessage', payload);
    Logger.log(nama + ' | "' + nilai + '" | getChat: ' +
      (info.ok ? 'OK (' + info.result.title + ')' : 'GAGAL: ' + info.error) +
      ' | kirim: ' + (tes.ok ? 'OK' : 'GAGAL: ' + tes.error));
  });
}
