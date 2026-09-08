/**
 * Template Kode Google Apps Script untuk Google Spreadsheet Database Utama GAJIKU
 * Salin dan tempel kode ini di Extensions > Apps Script pada Google Spreadsheet Anda.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================
 * BACKEND GAJIKU - GOOGLE SPREADSHEET DATABASE API
 * ==============================================================
 * Petunjuk Pemasangan:
 * 1. Buka Google Spreadsheet baru
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus semua kode default dan tempel seluruh isi script ini
 * 4. Klik tombol 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru)
 * 5. Pilih jenis 'Web app' (Aplikasi web)
 * 6. Set 'Execute as' (Jalankan sebagai): 'Me' (Saya)
 * 7. Set 'Who has access' (Siapa yang memiliki akses): 'Anyone' (Siapa saja)
 * 8. Klik 'Deploy' dan salin URL Web App yang dihasilkan ke menu Pengaturan GAJIKU.
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: KARYAWAN
  var sheetKaryawan = ss.getSheetByName("KARYAWAN");
  if (!sheetKaryawan) {
    sheetKaryawan = ss.insertSheet("KARYAWAN");
    sheetKaryawan.appendRow([
      "ID", "Nama", "No WhatsApp", "No Rekening", "Nama Bank",
      "Jabatan", "Status", "Tanggal Bergabung", "Link Slip", "Token Akses", "Divisi"
    ]);
    sheetKaryawan.getRange("A1:K1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
  }
  
  // Sheet 2: PENGGAJIAN
  var sheetPayroll = ss.getSheetByName("PENGGAJIAN");
  if (!sheetPayroll) {
    sheetPayroll = ss.insertSheet("PENGGAJIAN");
    sheetPayroll.appendRow([
      "ID", "Nama", "Tipe Gaji", "Hadir", "Gaji Pokok", "Lembur",
      "Bonus Koor 1", "Bonus Koor 2", "Bonus 1", "Bonus 2", "Bonus 3",
      "Telat", "Gaji Diambil Dalam 1 Minggu", "Total", "Keterangan", "Komentar", "Periode", "Tanggal Dibuat", "Divisi"
    ]);
    sheetPayroll.getRange("A1:S1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
  }
  
  // Sheet 3: PENGATURAN
  var sheetSettings = ss.getSheetByName("PENGATURAN");
  if (!sheetSettings) {
    sheetSettings = ss.insertSheet("PENGATURAN");
    sheetSettings.appendRow(["Kunci", "Nilai"]);
    sheetSettings.appendRow(["Nama Perusahaan", "PT BERKAH MANDIRI ABADI"]);
    sheetSettings.appendRow(["Logo Perusahaan", "🏢"]);
    sheetSettings.appendRow(["Alamat", "Jl. Industri Kreatif No. 45, Kawasan Sentra Bisnis"]);
    sheetSettings.appendRow(["Nomor WhatsApp Admin", "6281234567890"]);
    sheetSettings.appendRow(["Nama Admin", "Budi Santoso"]);
    sheetSettings.appendRow(["Tahun", "2026"]);
    sheetSettings.appendRow(["Periode Aktif", "September 2026 Minggu 1"]);
    sheetSettings.getRange("A1:B1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
  }
  
  // Sheet 4: DAFTAR_PERIODE
  var sheetPeriode = ss.getSheetByName("DAFTAR_PERIODE");
  if (!sheetPeriode) {
    sheetPeriode = ss.insertSheet("DAFTAR_PERIODE");
    sheetPeriode.appendRow([
      "ID Periode", "Nama Periode", "Tipe", "Bulan", "Tahun",
      "Nama Sheet Tab", "Status", "Tanggal Dibuat"
    ]);
    sheetPeriode.appendRow([
      "2026-09-M1", "September 2026 Minggu 1", "Mingguan", "September", "2026",
      "GAJI_Sep_2026_M1", "Aktif", "2026-09-01"
    ]);
    sheetPeriode.getRange("A1:H1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
  }
}

function doGet(e) {
  setupSheets();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getEmployees";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    if (action === "getPeriods") {
      var sheetP = ss.getSheetByName("DAFTAR_PERIODE");
      var periods = [];
      if (sheetP) {
        var dataP = sheetP.getDataRange().getValues();
        for (var p = 1; p < dataP.length; p++) {
          var pRow = dataP[p];
          if (pRow[0] || pRow[1]) {
            periods.push({
              id: String(pRow[0] || "PER-" + p),
              nama: String(pRow[1] || ""),
              tipe: String(pRow[2] || "Mingguan"),
              bulan: String(pRow[3] || ""),
              tahun: String(pRow[4] || "2026"),
              sheetTabName: String(pRow[5] || ""),
              status: String(pRow[6] || "Aktif"),
              tanggalDibuat: String(pRow[7] || "")
            });
          }
        }
      }
      return jsonResponse({ success: true, data: periods });
    }
    if (action === "getEmployees") {
      var sheet = ss.getSheetByName("KARYAWAN");
      var data = sheet.getDataRange().getValues();
      var employees = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[0]) {
          employees.push({
            id: String(row[0]),
            nama: String(row[1]),
            noWhatsapp: String(row[2]),
            noRekening: String(row[3]),
            namaBank: String(row[4]),
            jabatan: String(row[5]),
            status: String(row[6]),
            tanggalBergabung: String(row[7]),
            linkSlip: String(row[8]),
            tokenAkses: String(row[9]),
            divisi: String(row[10] || "Apparel")
          });
        }
      }
      return jsonResponse({ success: true, data: employees });
    }
    
    if (action === "getPayroll") {
      var sheet = ss.getSheetByName("PENGGAJIAN");
      var data = sheet.getDataRange().getValues();
      var payrolls = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[0]) {
          var hasKomentarCol = row.length > 17 || (row[17] !== undefined && row[17] !== "");
          payrolls.push({
            id: String(row[0]),
            employeeId: String(row[0]).split("-")[0] || String(row[0]),
            nama: String(row[1]),
            tipeGaji: String(row[2]),
            hadir: Number(row[3]) || 0,
            gajiPokok: Number(row[4]) || 0,
            lembur: Number(row[5]) || 0,
            bonusKoor1: Number(row[6]) || 0,
            bonusKoor2: Number(row[7]) || 0,
            bonus1: Number(row[8]) || 0,
            bonus2: Number(row[9]) || 0,
            bonus3: Number(row[10]) || 0,
            telat: Number(row[11]) || 0,
            gajiDiambil: Number(row[12]) || 0,
            total: Number(row[13]) || 0,
            keterangan: String(row[14] || ""),
            komentar: hasKomentarCol ? String(row[15] || "") : "",
            periode: hasKomentarCol ? String(row[16] || "") : String(row[15] || ""),
            tanggalDibuat: hasKomentarCol ? String(row[17] || "") : String(row[16] || ""),
            divisi: String(row[18] || "Apparel")
          });
        }
      }
      return jsonResponse({ success: true, data: payrolls });
    }
    
    if (action === "getPayrollByEmployee") {
      var empId = e.parameter.id;
      var sheet = ss.getSheetByName("PENGGAJIAN");
      var data = sheet.getDataRange().getValues();
      var payrolls = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (String(row[0]) === empId || String(row[1]).toLowerCase() === String(empId).toLowerCase()) {
          var hasKomentarCol = row.length > 17 || (row[17] !== undefined && row[17] !== "");
          payrolls.push({
            id: String(row[0]),
            nama: String(row[1]),
            tipeGaji: String(row[2]),
            hadir: Number(row[3]) || 0,
            gajiPokok: Number(row[4]) || 0,
            lembur: Number(row[5]) || 0,
            bonusKoor1: Number(row[6]) || 0,
            bonusKoor2: Number(row[7]) || 0,
            bonus1: Number(row[8]) || 0,
            bonus2: Number(row[9]) || 0,
            bonus3: Number(row[10]) || 0,
            telat: Number(row[11]) || 0,
            gajiDiambil: Number(row[12]) || 0,
            total: Number(row[13]) || 0,
            keterangan: String(row[14] || ""),
            komentar: hasKomentarCol ? String(row[15] || "") : "",
            periode: hasKomentarCol ? String(row[16] || "") : String(row[15] || ""),
            tanggalDibuat: hasKomentarCol ? String(row[17] || "") : String(row[16] || "")
          });
        }
      }
      return jsonResponse({ success: true, data: payrolls });
    }
    
    if (action === "getSlip") {
      var token = e.parameter.token;
      var sheetEmp = ss.getSheetByName("KARYAWAN");
      var dataEmp = sheetEmp.getDataRange().getValues();
      var targetEmp = null;
      for (var i = 1; i < dataEmp.length; i++) {
        if (String(dataEmp[i][9]).trim() === String(token).trim()) {
          targetEmp = {
            id: String(dataEmp[i][0]),
            nama: String(dataEmp[i][1]),
            noWhatsapp: String(dataEmp[i][2]),
            noRekening: String(dataEmp[i][3]),
            namaBank: String(dataEmp[i][4]),
            jabatan: String(dataEmp[i][5]),
            status: String(dataEmp[i][6]),
            tanggalBergabung: String(dataEmp[i][7]),
            linkSlip: String(dataEmp[i][8]),
            tokenAkses: String(dataEmp[i][9])
          };
          break;
        }
      }
      
      if (!targetEmp) {
        return jsonResponse({ success: false, message: "Token slip gaji tidak ditemukan." });
      }
      
      var sheetPay = ss.getSheetByName("PENGGAJIAN");
      var dataPay = sheetPay.getDataRange().getValues();
      var latestPay = null;
      for (var j = dataPay.length - 1; j >= 1; j--) {
        if (String(dataPay[j][0]) === targetEmp.id || String(dataPay[j][1]).toLowerCase() === targetEmp.nama.toLowerCase()) {
          var pRow = dataPay[j];
          var hasKomentarCol = pRow.length > 17 || (pRow[17] !== undefined && pRow[17] !== "");
          latestPay = {
            id: String(pRow[0]),
            nama: String(pRow[1]),
            tipeGaji: String(pRow[2]),
            hadir: Number(pRow[3]) || 0,
            gajiPokok: Number(pRow[4]) || 0,
            lembur: Number(pRow[5]) || 0,
            bonusKoor1: Number(pRow[6]) || 0,
            bonusKoor2: Number(pRow[7]) || 0,
            bonus1: Number(pRow[8]) || 0,
            bonus2: Number(pRow[9]) || 0,
            bonus3: Number(pRow[10]) || 0,
            telat: Number(pRow[11]) || 0,
            gajiDiambil: Number(pRow[12]) || 0,
            total: Number(pRow[13]) || 0,
            keterangan: String(pRow[14] || ""),
            komentar: hasKomentarCol ? String(pRow[15] || "") : "",
            periode: hasKomentarCol ? String(pRow[16] || "") : String(pRow[15] || ""),
            tanggalDibuat: hasKomentarCol ? String(pRow[17] || "") : String(pRow[16] || "")
          };
          break;
        }
      }
      
      return jsonResponse({
        success: true,
        data: {
          employee: targetEmp,
          payroll: latestPay
        }
      });
    }
    
    return jsonResponse({ success: true, message: "GAJIKU API Online", status: "ready" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  setupSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  var body = {};
  
  if (e && e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch(err) {
      body = e.parameter || {};
    }
  } else {
    body = e.parameter || {};
  }
  
  if (!action && body.action) {
    action = body.action;
  }
  
  try {
    if (action === "addEmployee") {
      var sheet = ss.getSheetByName("KARYAWAN");
      sheet.appendRow([
        body.id || "",
        body.nama || "",
        body.noWhatsapp || "",
        body.noRekening || "",
        body.namaBank || "",
        body.jabatan || "",
        body.status || "Aktif",
        body.tanggalBergabung || new Date().toISOString().split("T")[0],
        body.linkSlip || "",
        body.tokenAkses || "",
        body.divisi || "Apparel"
      ]);
      return jsonResponse({ success: true, message: "Karyawan berhasil ditambahkan" });
    }
    
    if (action === "updateEmployee") {
      var sheet = ss.getSheetByName("KARYAWAN");
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.getRange(i + 1, 1, 1, 11).setValues([[
            body.id,
            body.nama !== undefined ? body.nama : data[i][1],
            body.noWhatsapp !== undefined ? body.noWhatsapp : data[i][2],
            body.noRekening !== undefined ? body.noRekening : data[i][3],
            body.namaBank !== undefined ? body.namaBank : data[i][4],
            body.jabatan !== undefined ? body.jabatan : data[i][5],
            body.status !== undefined ? body.status : data[i][6],
            body.tanggalBergabung !== undefined ? body.tanggalBergabung : data[i][7],
            body.linkSlip !== undefined ? body.linkSlip : data[i][8],
            body.tokenAkses !== undefined ? body.tokenAkses : data[i][9],
            body.divisi !== undefined ? body.divisi : (data[i][10] || "Apparel")
          ]]);
          return jsonResponse({ success: true, message: "Karyawan berhasil diperbarui" });
        }
      }
      return jsonResponse({ success: false, message: "Karyawan tidak ditemukan" });
    }
    
    if (action === "deleteEmployee") {
      var sheet = ss.getSheetByName("KARYAWAN");
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: "Karyawan berhasil dihapus" });
        }
      }
      return jsonResponse({ success: false, message: "Karyawan tidak ditemukan" });
    }
    
    if (action === "addPayroll") {
      var sheet = ss.getSheetByName("PENGGAJIAN");
      sheet.appendRow([
        body.id || "",
        body.nama || "",
        body.tipeGaji || "Harian",
        Number(body.hadir) || 0,
        Number(body.gajiPokok) || 0,
        Number(body.lembur) || 0,
        Number(body.bonusKoor1) || 0,
        Number(body.bonusKoor2) || 0,
        Number(body.bonus1) || 0,
        Number(body.bonus2) || 0,
        Number(body.bonus3) || 0,
        Number(body.telat) || 0,
        Number(body.gajiDiambil) || 0,
        Number(body.total) || 0,
        body.keterangan || "",
        body.komentar || "",
        body.periode || "",
        body.tanggalDibuat || new Date().toISOString().split("T")[0],
        body.divisi || "Apparel"
      ]);
      return jsonResponse({ success: true, message: "Penggajian berhasil disimpan ke Google Sheet" });
    }
    
    if (action === "updatePayroll") {
      var sheet = ss.getSheetByName("PENGGAJIAN");
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var rowPeriode = String(data[i][16] || data[i][15] || "");
        if (String(data[i][0]) === String(body.id) && (!body.periode || rowPeriode === String(body.periode))) {
          sheet.getRange(i + 1, 1, 1, 18).setValues([[
            body.id,
            body.nama,
            body.tipeGaji,
            Number(body.hadir) || 0,
            Number(body.gajiPokok) || 0,
            Number(body.lembur) || 0,
            Number(body.bonusKoor1) || 0,
            Number(body.bonusKoor2) || 0,
            Number(body.bonus1) || 0,
            Number(body.bonus2) || 0,
            Number(body.bonus3) || 0,
            Number(body.telat) || 0,
            Number(body.gajiDiambil) || 0,
            Number(body.total) || 0,
            body.keterangan || "",
            body.komentar || "",
            body.periode || rowPeriode,
            body.tanggalDibuat || data[i][17] || data[i][16]
          ]]);
          return jsonResponse({ success: true, message: "Penggajian berhasil diperbarui" });
        }
      }
      return jsonResponse({ success: false, message: "Data penggajian tidak ditemukan" });
    }

    if (action === "updateComment") {
      var targetId = String(body.id || "");
      var targetPeriode = String(body.periode || "");
      var comment = String(body.komentar || "");
      var updated = false;

      var sheet = ss.getSheetByName("PENGGAJIAN");
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var rId = String(data[i][0]);
          var rPer = String(data[i][16] || data[i][15] || "");
          if (rId === targetId || (targetPeriode && rId.includes(targetId) && rPer === targetPeriode)) {
            // Kolom Komentar adalah kolom P (ke-16)
            sheet.getRange(i + 1, 16).setValue(comment);
            updated = true;
            break;
          }
        }
      }

      // Update juga di sheet tab periode jika ada
      if (targetPeriode) {
        var tabName = body.sheetTabName || ("GAJI_" + targetPeriode.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30));
        var tabSheet = ss.getSheetByName(tabName) || ss.getSheetByName(targetPeriode);
        if (tabSheet) {
          var tData = tabSheet.getDataRange().getValues();
          for (var t = 1; t < tData.length; t++) {
            if (String(tData[t][0]) === targetId || String(tData[t][1]).toLowerCase() === targetId.toLowerCase()) {
              // Kolom Komentar di sheet tab periode adalah kolom Q (ke-17)
              tabSheet.getRange(t + 1, 17).setValue(comment);
              updated = true;
              break;
            }
          }
        }
      }

      return jsonResponse({ success: true, message: "Komentar berhasil disimpan ke Google Spreadsheet", updated: updated });
    }
    
    if (action === "deletePayroll") {
      var sheet = ss.getSheetByName("PENGGAJIAN");
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.id)) {
          sheet.deleteRow(i + 1);
          return jsonResponse({ success: true, message: "Data penggajian berhasil dihapus" });
        }
      }
      return jsonResponse({ success: false, message: "Data penggajian tidak ditemukan" });
    }
    
    if (action === "addPeriod") {
      var periodeName = body.nama || ("Periode " + new Date().toISOString().split("T")[0]);
      var tabName = body.sheetTabName || ("GAJI_" + periodeName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30));
      var tipe = body.tipe || "Mingguan";
      var bulan = body.bulan || "September";
      var tahun = body.tahun || "2026";
      var setAsActive = body.setAsActive !== false;
      var populateEmployees = body.populateEmployees !== false;

      // 1. Catat di sheet DAFTAR_PERIODE
      var sheetPeriode = ss.getSheetByName("DAFTAR_PERIODE");
      if (!sheetPeriode) {
        sheetPeriode = ss.insertSheet("DAFTAR_PERIODE");
        sheetPeriode.appendRow(["ID Periode", "Nama Periode", "Tipe", "Bulan", "Tahun", "Nama Sheet Tab", "Status", "Tanggal Dibuat"]);
        sheetPeriode.getRange("A1:H1").setFontWeight("bold").setBackground("#2563EB").setFontColor("#FFFFFF");
      }
      var newPeriodId = body.id || ("PER-" + new Date().getTime());
      sheetPeriode.appendRow([
        newPeriodId,
        periodeName,
        tipe,
        bulan,
        tahun,
        tabName,
        "Aktif",
        new Date().toISOString().split("T")[0]
      ]);

      // 2. Jika diset sebagai periode aktif, update di sheet PENGATURAN
      if (setAsActive) {
        var sheetSettings = ss.getSheetByName("PENGATURAN");
        if (sheetSettings) {
          var dataSettings = sheetSettings.getDataRange().getValues();
          for (var s = 1; s < dataSettings.length; s++) {
            if (String(dataSettings[s][0]).toLowerCase() === "periode aktif") {
              sheetSettings.getRange(s + 1, 2).setValue(periodeName);
              break;
            }
          }
        }
      }

      // 3. Buat Sheet Tab Baru Khusus Periode Ini dengan Kolom Lengkap
      var targetSheet = ss.getSheetByName(tabName);
      if (!targetSheet) {
        targetSheet = ss.insertSheet(tabName);
      } else {
        targetSheet.clear();
      }

      var headers = [
        "ID Karyawan", "Nama Karyawan", "Jabatan", "Tipe Gaji", "Hari Hadir",
        "Gaji Pokok", "Lembur (Jam)", "Bonus Koor 1", "Bonus Koor 2",
        "Bonus 1", "Bonus 2", "Bonus 3", "Potongan Telat (Kali)", "Gaji Diambil",
        "Total Gaji (Formula Otomatis)", "Keterangan", "Komentar", "Link Slip"
      ];
      targetSheet.appendRow(headers);
      targetSheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#1E40AF")
        .setFontColor("#FFFFFF")
        .setHorizontalAlignment("center");
      targetSheet.setFrozenRows(1);

      // 4. Masukkan baris-baris karyawan aktif jika populateEmployees true
      var addedCount = 0;
      var sheetKaryawan = ss.getSheetByName("KARYAWAN");
      var sheetPayrollInduk = ss.getSheetByName("PENGGAJIAN");

      if (sheetKaryawan) {
        var dataKaryawan = sheetKaryawan.getDataRange().getValues();
        for (var k = 1; k < dataKaryawan.length; k++) {
          var kRow = dataKaryawan[k];
          var empId = String(kRow[0]);
          var empNama = String(kRow[1]);
          var empJabatan = String(kRow[5] || "");
          var empStatus = String(kRow[6] || "Aktif");
          var empLink = String(kRow[8] || "");

          if (empId && empStatus.toLowerCase() !== "nonaktif") {
            var rowIndex = targetSheet.getLastRow() + 1;
            var isBorongan = empJabatan.toLowerCase().includes("borongan");
            var tipeGajiEmp = isBorongan ? "Borongan" : "Harian";
            var defaultHadir = isBorongan ? 1 : 6;
            var defaultGajiPokok = isBorongan ? 500000 : 100000;
            var defaultBonusKoor = empJabatan.toLowerCase().includes("koor") ? 100000 : 0;

            // Formula Excel/Spreadsheet dinamis untuk kolom O (Total Gaji):
            // Harian = (Hadir * GajiPokok) + (Lembur * GajiPokok) + Bonus - (Telat * 5) - GajiDiambil
            // Borongan = GajiPokok + (Lembur * GajiPokok) + Bonus - (Telat * 5) - GajiDiambil
            var formula = '=IF(D' + rowIndex + '="Harian", (E' + rowIndex + '*F' + rowIndex + ')+(G' + rowIndex + '*F' + rowIndex + ')+H' + rowIndex + '+I' + rowIndex + '+J' + rowIndex + '+K' + rowIndex + '+L' + rowIndex + '-(M' + rowIndex + '*5)-N' + rowIndex + ', F' + rowIndex + '+(G' + rowIndex + '*F' + rowIndex + ')+H' + rowIndex + '+I' + rowIndex + '+J' + rowIndex + '+K' + rowIndex + '+L' + rowIndex + '-(M' + rowIndex + '*5)-N' + rowIndex + ')';

            targetSheet.appendRow([
              empId,
              empNama,
              empJabatan,
              tipeGajiEmp,
              defaultHadir,
              defaultGajiPokok,
              0, // Lembur
              defaultBonusKoor,
              0, // Bonus Koor 2
              0, // Bonus 1
              0, // Bonus 2
              0, // Bonus 3
              0, // Telat
              0, // Gaji Diambil
              formula,
              "Otomatis dibuat untuk " + periodeName,
              "", // Komentar awal
              empLink
            ]);

            // Juga masukkan ke sheet PENGGAJIAN induk dengan perkiraan nilai awal
            if (sheetPayrollInduk) {
              var initTotal = isBorongan ? defaultGajiPokok + defaultBonusKoor : (defaultHadir * defaultGajiPokok) + defaultBonusKoor;
              sheetPayrollInduk.appendRow([
                empId + "-" + newPeriodId,
                empNama,
                tipeGajiEmp,
                defaultHadir,
                defaultGajiPokok,
                0,
                defaultBonusKoor,
                0,
                0,
                0,
                0,
                0,
                0,
                initTotal,
                "Periode " + periodeName,
                "", // Komentar awal
                periodeName,
                new Date().toISOString().split("T")[0]
              ]);
            }
            addedCount++;
          }
        }

        if (addedCount > 0) {
          targetSheet.getRange(2, 5, addedCount, 11).setNumberFormat("#,##0");
        }
      }

      targetSheet.autoResizeColumns(1, headers.length);

      return jsonResponse({
        success: true,
        message: "Tab sheet '" + tabName + "' berhasil dibuat otomatis dengan " + headers.length + " kolom dan " + addedCount + " data karyawan!",
        data: {
          id: newPeriodId,
          nama: periodeName,
          sheetTabName: tabName,
          addedEmployeesCount: addedCount
        }
      });
    }
    
    return jsonResponse({ success: false, message: "Action tidak dikenal: " + action });
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
