/**
 * Ekspedisi 9 Nilai P3MD: response receiver.
 *
 * Bind this script to the Google Sheet that should hold the answers
 * (Extensions -> Apps Script), then deploy it as a Web app:
 *   Execute as: Me    Who has access: Anyone
 *
 * Every request carries the Google ID token the site received at sign-in.
 * The token is verified here, on Google's servers, before anything is written:
 * correct audience (our OAuth Client ID), verified email, allowed domain,
 * not expired. One submission per email: a second submission is rejected
 * and the earlier answers are returned so the site can show them read-only.
 *
 * No secrets live in this file. The Client ID is public by design.
 */

const CLIENT_ID = "1076661932959-vn578ee8sjpbjshvqumels22l05mcgba.apps.googleusercontent.com";
const ALLOWED_DOMAIN = "p3md.sbm-itb.ac.id";
const SHEET_NAME = "Jawaban";
const N_A = 9;
const N_B = 62;
/* 0-based Bagian B items that the form marks as optional. */
const OPTIONAL_B = [7, 9];

const HEADERS = [
  "Waktu kirim",
  "Email",
  "Nama",
  "Grup",
  "Elemen",
  "Kelas",
  "A1. Penerapan nilai 1. Karakter dan Integritas",
  "A2. Penerapan nilai 2. Kepemimpinan",
  "A3. Penerapan nilai 3. Komunikasi dan Adaptabilitas",
  "A4. Penerapan nilai 4. Resiliensi Fisik dan Mental",
  "A5. Penerapan nilai 5. Analytical Thinking dan Problem Solving",
  "A6. Penerapan nilai 6. Manajemen dan Eksekusi",
  "A7. Penerapan nilai 7. Governance dan Etika Publik",
  "A8. Penerapan nilai 8. Nation Building dan Public Purpose",
  "A9. Penerapan nilai 9. Collaboration dan Stakeholder Leadership",
  "B1. Serdik P3MDI mematuhi aturan bersama saat tidak ada yang mengawasi.",
  "B2. Serdik P3MDI memperlakukan teman, petugas, dan staf pendukung dengan hormat, sama seperti saat menghormati pimpinan.",
  "B3. Serdik P3MDI menegur penyimpangan yang terlihat, meskipun pelakunya teman dekat.",
  "B4. Serdik P3MDI tidak menggunakan fasilitas atau kemudahan yang bukan haknya.",
  "B5. Serdik P3MDI memperlakukan wewenang yang diberikan sebagai amanah, bukan keistimewaan.",
  "B6. Serdik P3MDI hadir tepat waktu pada setiap kegiatan.",
  "B7. Serdik P3MDI memiliki inisiatif yang tinggi untuk menjadi pemimpin, baik dalam lingkungan yang kecil maupun lingkungan yang besar.",
  "B8. Serdik P3MDI memberi instruksi yang jelas saat memimpin tim.",
  "B9. Serdik P3MDI tidak menyalahkan anggota tim ketika hasil kerja tim kurang baik.",
  "B10. Serdik P3MDI menggerakkan tim sampai rencana benar-benar dijalankan.",
  "B11. Serdik P3MDI mengaitkan keputusan tim dengan kepentingan organisasi dan bangsa.",
  "B12. Serdik P3MDI mengubah perilakunya setelah menerima koreksi.",
  "B13. Serdik P3MDI mendengarkan lawan bicara sampai selesai tanpa memotong.",
  "B14. Ketika serdik P3MDI berbeda pendapat, ia mencari kepentingan kedua pihak, bukan hanya mempertahankan posisinya.",
  "B15. Serdik P3MDI menyampaikan ketidaksetujuan dengan bahasa yang santun dan tidak merendahkan.",
  "B16. Serdik P3MDI menjaga hubungan baik dengan pihak yang berbeda pandangan.",
  "B17. Serdik P3MDI tetap bekerja efektif ketika instruksi atau jadwal berubah mendadak.",
  "B18. Serdik P3MDI menyesuaikan cara kerjanya ketika sumber daya berkurang.",
  "B19. Serdik P3MDI menjalani latihan fisik secara teratur dan bertahap sesuai kemampuannya.",
  "B20. Serdik P3MDI bersemangat dalam semua kegiatan, tanpa pernah merasa lelah sedikit pun.",
  "B21. Serdik P3MDI tetap tenang di depan tim saat situasi tidak pasti.",
  "B22. Serdik P3MDI menjaga tidur, makan, dan hidrasi agar tetap pulih saat beban kegiatan tinggi.",
  "B23. Serdik P3MDI tahu dan menerapkan cara yang sehat untuk meredakan tekanan.",
  "B24. Serdik P3MDI mengendalikan emosi saat lelah, ditegur, atau berkonflik.",
  "B25. Serdik P3MDI mampu membedakan fakta, asumsi, opini, dan rumor sebelum menyimpulkan.",
  "B26. Serdik P3MDI mendasarkan rekomendasi pada data atau bukti.",
  "B27. Serdik P3MDI memakai metode seperti 5 Why atau fishbone untuk menganalisis masalah.",
  "B28. Serdik P3MDI menyiapkan lebih dari satu skenario (terbaik, terburuk, paling mungkin) sebelum memutuskan.",
  "B29. Serdik P3MDI menentukan tanda pemicu dan respons untuk setiap skenario yang mungkin terjadi.",
  "B30. Serdik P3MDI tidak pernah bingung saat dihadapkan situasi dinamis yang penuh ketidakpastian.",
  "B31. Saya mengubah arahan umum menjadi tugas konkret dengan penanggung jawab dan tenggat.",
  "B32. Saya menyusun rencana kerja sebelum memulai tugas besar.",
  "B33. Saya memantau progres tugas terhadap target yang ditetapkan.",
  "B34. Saya mencatat risiko dan rencana mitigasinya sejak awal tugas.",
  "B35. Saya membantu tim memahami alasan perubahan sebelum menjalankannya.",
  "B36. Saya segera memperbarui rencana kerja ketika terjadi perubahan.",
  "B37. Saya memeriksa kualitas hasil kerja sebelum menyatakannya selesai.",
  "B38. Saya memulai pekerjaan atau ide baru tetapi tidak menuntaskannya.",
  "B39. Hasil kerja saya sempurna tanpa kekurangan apa pun.",
  "B40. Saya memeriksa kesesuaian tindakan saya dengan aturan dan proses sebelum bertindak.",
  "B41. Saya mengerjakan tugas kelompok dengan pembagian peran dan catatan kontribusi yang terbuka.",
  "B42. Saya membaca aturan atau SOP yang berlaku sebelum menjalankan tugas terkait.",
  "B43. Saya memahami batas kewenangan saya dalam setiap peran.",
  "B44. Saya mendukung setiap laporan saya dengan bukti.",
  "B45. Saya mencari pembenaran saat keputusan saya dipertanyakan.",
  "B46. Saya menyampaikan potensi konflik kepentingan sebelum terlibat dalam suatu keputusan.",
  "B47. Saya menghindari penggunaan kedekatan atau relasi untuk mendapat kemudahan.",
  "B48. Saya menjalankan kewajiban sebagai warga negara dalam perilaku sehari-hari, seperti tertib dan menjaga fasilitas umum.",
  "B49. Saya menghormati simbol negara dalam sikap saya saat apel, upacara, dan kegiatan resmi.",
  "B50. Saya menghormati perbedaan suku, agama, dan budaya sebagai bagian dari persatuan bangsa.",
  "B51. Saya mengambil pelajaran dari sejarah perjuangan bangsa untuk pekerjaan atau keputusan saya.",
  "B52. Saya dapat menjelaskan peran negara dan BUMN dalam tugas yang saya kerjakan.",
  "B53. Saya mengaitkan tugas saya dengan dampaknya bagi masyarakat.",
  "B54. Saya memilih opsi dengan manfaat publik lebih besar saat kepentingan pribadi dan publik berbenturan.",
  "B55. Saya memandang jabatan terutama sebagai jalan untuk kepentingan pribadi.",
  "B56. Saya memetakan pihak yang berkepentingan beserta pengaruhnya sebelum memulai pekerjaan lintas tim.",
  "B57. Saya mengutamakan keberhasilan kelompok saya walaupun merugikan kerja sama lintas kelompok.",
  "B58. Saya menepati komitmen yang telah disepakati dengan mitra kerja.",
  "B59. Saya memberi pengakuan atas kontribusi pihak lain.",
  "B60. Saya memperhitungkan perbedaan logika pemerintah, BUMN, swasta, dan masyarakat saat bekerja sama.",
  "B61. Saya mencari solusi yang memberi nilai publik sekaligus dapat dijalankan oleh semua mitra.",
  "B62. Saya sependapat dengan semua orang tanpa pernah merasa kesal kepada siapa pun.",
  "Terakhir diperbarui",
  "Jumlah kirim"
];

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const who = verifyToken_(body.idToken);
    if (body.action === "status") return json_(status_(who.email));
    if (body.action === "submit") return json_(submit_(who, body));
    return json_({ ok: false, error: "bad_action", message: "Permintaan tidak dikenal." });
  } catch (err) {
    const code = err && err.code ? err.code : "server_error";
    const message = err && err.code ? err.message : "Terjadi kesalahan di server. Coba lagi sebentar lagi.";
    if (!err || !err.code) console.error(err);
    return json_({ ok: false, error: code, message: message });
  }
}

/* Health check: opening the web app URL in a browser shows this. */
function doGet() {
  return json_({ ok: true, service: "Ekspedisi 9 Nilai P3MD", time: new Date().toISOString() });
}

function verifyToken_(token) {
  if (!token || typeof token !== "string") fail_("no_token", "Sesi login tidak ditemukan. Masuk ulang dengan Google.");
  const res = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) fail_("token_invalid", "Sesi login sudah kedaluwarsa. Masuk ulang dengan Google lalu kirim lagi.");
  const t = JSON.parse(res.getContentText());
  if (t.aud !== CLIENT_ID) fail_("token_invalid", "Token login bukan untuk situs ini.");
  if (String(t.email_verified) !== "true") fail_("not_verified", "Email akun Google belum terverifikasi.");
  const email = String(t.email || "").toLowerCase();
  if (t.hd !== ALLOWED_DOMAIN && !email.endsWith("@" + ALLOWED_DOMAIN)) fail_("wrong_domain", "Gunakan akun @" + ALLOWED_DOMAIN + ".");
  if (Number(t.exp) * 1000 < Date.now()) fail_("token_invalid", "Sesi login sudah kedaluwarsa. Masuk ulang dengan Google lalu kirim lagi.");
  return { email: email, name: t.name || "" };
}

function submit_(who, body) {
  const nama = String(body.nama || "").trim().slice(0, 120);
  const grup = String(body.grup || ""), elemen = String(body.elemen || ""), kelas = String(body.kelas || "");
  if (!nama) fail_("invalid", "Nama belum diisi.");
  if (["1", "2", "3", "4"].indexOf(grup) < 0) fail_("invalid", "Grup tidak valid.");
  if (["1", "2", "3"].indexOf(elemen) < 0) fail_("invalid", "Elemen tidak valid.");
  if ("ABCDEFGH".split("").indexOf(kelas) < 0) fail_("invalid", "Kelas tidak valid.");
  const a = clean_(body.a, N_A, []);
  const b = clean_(body.b, N_B, OPTIONAL_B);

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const now = new Date();
    const emails = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
    const idx = emails.indexOf(who.email);
    if (idx >= 0) {
      const prev = rowToRecord_(sh.getRange(idx + 2, 1, 1, HEADERS.length).getValues()[0]);
      return Object.assign({ ok: false, error: "already_submitted",
        message: "Akun ini sudah mengirim jawaban. Setiap serdik hanya bisa mengirim satu kali." }, prev);
    }
    const base = [nama, grup, elemen, kelas].concat(a, b);
    sh.appendRow([now, who.email].concat(base, [now, 1]));
    return { ok: true, updated: false, at: now.toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function status_(email) {
  const sh = sheet_();
  if (sh.getLastRow() < 2) return { ok: true, submitted: false };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === email) {
      return Object.assign({ ok: true }, rowToRecord_(rows[i]));
    }
  }
  return { ok: true, submitted: false };
}

/* Turn a sheet row back into the shape the site stores, so a serdik who
   already submitted sees their own answers (read-only) on any device. */
function rowToRecord_(r) {
  const num = v => (v === "" || v === null) ? null : Number(v);
  return {
    submitted: true,
    at: new Date(r[0]).toISOString(),
    nama: String(r[2]), grup: String(r[3]), elemen: String(r[4]), kelas: String(r[5]),
    a: r.slice(6, 6 + N_A).map(num),
    b: r.slice(6 + N_A, 6 + N_A + N_B).map(num)
  };
}

function clean_(arr, n, optional) {
  if (!Array.isArray(arr) || arr.length !== n) fail_("invalid", "Jumlah jawaban tidak sesuai. Muat ulang halaman lalu coba lagi.");
  return arr.map((v, i) => {
    if (v === "" || v === null) {
      if (optional.indexOf(i) >= 0) return "";
      fail_("invalid", "Masih ada pernyataan wajib yang belum dijawab.");
    }
    const x = Number(v);
    if (!(x >= 1 && x <= 5 && Math.floor(x) === x)) fail_("invalid", "Ada jawaban di luar skala 1 sampai 5.");
    return x;
  });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setWrap(true);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(3);
  }
  return sh;
}

function fail_(code, message) {
  const e = new Error(message);
  e.code = code;
  throw e;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor to create the sheet and grant permissions. */
function setup() {
  sheet_();
  UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=x", { muteHttpExceptions: true });
}
