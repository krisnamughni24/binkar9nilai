/**
 * Ekspedisi 9 Nilai P3MD: response receiver (instrument v2).
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
 * Instrument v2:
 *   1-27   statements about Serdik P3MDI in general, scale 1-4
 *   S1-S10 soft-skill self-rating, scale 1-5
 *   S11    exactly 3 soft skills to develop (stored like a Google Forms checkbox: "A, B, C")
 *
 * No secrets live in this file. The Client ID is public by design.
 */

const CLIENT_ID = "1076661932959-vn578ee8sjpbjshvqumels22l05mcgba.apps.googleusercontent.com";
const ALLOWED_DOMAIN = "p3md.sbm-itb.ac.id";
/* New tab for v2 so rows from the earlier 71-item version never mix with these. */
const SHEET_NAME = "Jawaban v2";
const N_N = 27;   // 9 Nilai statements, scale 1-4
const N_S = 10;   // soft skills, scale 1-5
const N_PICK = 3; // S11: pick exactly 3

const SOFT_LABELS = [
  "Emotional Intelligence (Kecerdasan Emosional)",
  "Teamwork & Collaboration (Kerja Sama dan Kolaborasi)",
  "Conflict Management (Manajemen Konflik)",
  "Negotiation & Influencing (Negosiasi dan Mempengaruhi)",
  "Creativity & Innovation (Kreativitas dan Inovasi)",
  "Learning Agility (Kelincahan Belajar)",
  "Coaching & Mentoring (Pembinaan dan Pendampingan)",
  "Self-Awareness (Kesadaran Diri)",
  "Empathy (Empati)",
  "Feedback Management (Pengelolaan Umpan Balik)"
];

const HEADERS = [
  "Waktu kirim",
  "Email",
  "Nama",
  "Grup",
  "Elemen",
  "Kelas",
  "1. Serdik P3MDI tetap mematuhi aturan bersama saat tidak ada yang mengawasi.",
  "2. Serdik P3MDI menegur penyimpangan, meskipun pelakunya teman dekat.",
  "3. Serdik P3MDI mengerjakan ujian atau pretest tanpa menyontek atau menjiplak.",
  "4. Serdik P3MDI mengajukan diri untuk memimpin saat ada tugas atau kegiatan.",
  "5. Serdik P3MDI mengambil tanggung jawab sebagai pemimpin ketika hasil kerja timnya kurang baik.",
  "6. Serdik P3MDI menggunakan wewenangnya untuk melayani tim, bukan untuk mendapat keistimewaan.",
  "7. Serdik P3MDI mendengarkan lawan bicara sampai selesai tanpa memotong.",
  "8. Serdik P3MDI menyampaikan ketidaksetujuan dengan bahasa yang santun.",
  "9. Serdik P3MDI tetap bekerja efektif ketika rencana berubah mendadak.",
  "10. Serdik P3MDI berlatih fisik secara teratur.",
  "11. Serdik P3MDI tetap mengendalikan emosinya saat berada di bawah tekanan.",
  "12. Serdik P3MDI membantu rekan yang terlihat kelelahan atau tertekan.",
  "13. Serdik P3MDI membedakan fakta dan opini saat berdiskusi.",
  "14. Serdik P3MDI mendasarkan usulannya pada data atau bukti.",
  "15. Serdik P3MDI mencari akar masalah (misalnya dengan 5 Why atau fishbone) sebelum mengusulkan solusi.",
  "16. Serdik P3MDI menyusun rencana kerja sebelum memulai tugas besar.",
  "17. Serdik P3MDI menyelesaikan tugas sebelum tenggat waktu.",
  "18. Serdik P3MDI menuntaskan pekerjaan yang sudah dimulainya.",
  "19. Serdik P3MDI mendukung laporannya dengan bukti.",
  "20. Serdik P3MDI menyampaikan potensi konflik kepentingan sebelum terlibat dalam suatu keputusan.",
  "21. Serdik P3MDI menggunakan fasilitas sesuai haknya.",
  "22. Serdik P3MDI bersikap hormat terhadap simbol negara saat apel, upacara, dan kegiatan resmi.",
  "23. Serdik P3MDI menunjukkan kesungguhan dalam seluruh rangkaian program P3MD.",
  "24. Serdik P3MDI memilih opsi dengan manfaat publik lebih besar saat kepentingan pribadi dan publik berbenturan.",
  "25. Serdik P3MDI bekerja sama dengan rekan dari grup lain, bukan hanya dengan kelompoknya sendiri.",
  "26. Serdik P3MDI bergaul dan bekerja sama tanpa membedakan suku, agama, dan budaya.",
  "27. Serdik P3MDI mendukung keberhasilan kelompok lain, tidak hanya kelompoknya sendiri.",
  "S1. Emotional Intelligence (Kecerdasan Emosional)",
  "S2. Teamwork & Collaboration (Kerja Sama dan Kolaborasi)",
  "S3. Conflict Management (Manajemen Konflik)",
  "S4. Negotiation & Influencing (Negosiasi dan Mempengaruhi)",
  "S5. Creativity & Innovation (Kreativitas dan Inovasi)",
  "S6. Learning Agility (Kelincahan Belajar)",
  "S7. Coaching & Mentoring (Pembinaan dan Pendampingan)",
  "S8. Self-Awareness (Kesadaran Diri)",
  "S9. Empathy (Empati)",
  "S10. Feedback Management (Pengelolaan Umpan Balik)",
  "S11. Pilih 3 soft skill yang paling ingin kamu kembangkan.",
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
  return json_({ ok: true, service: "Ekspedisi 9 Nilai P3MD", version: 2, time: new Date().toISOString() });
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
  const n = scale_(body.n, N_N, 4, "pernyataan 9 Nilai");
  const s = scale_(body.s, N_S, 5, "penilaian soft skill");
  const picks = picks_(body.picks);

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const now = new Date();
    const idx = emails_(sh).indexOf(who.email);
    if (idx >= 0) {
      const prev = rowToRecord_(sh.getRange(idx + 2, 1, 1, HEADERS.length).getValues()[0]);
      return Object.assign({ ok: false, error: "already_submitted",
        message: "Akun ini sudah mengirim jawaban. Setiap serdik hanya bisa mengirim satu kali." }, prev);
    }
    const picksText = picks.map(k => SOFT_LABELS[k]).join(", ");
    sh.appendRow([now, who.email, nama, grup, elemen, kelas].concat(n, s, [picksText, now, 1]));
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
    if (String(rows[i][1]).toLowerCase() === email) return Object.assign({ ok: true }, rowToRecord_(rows[i]));
  }
  return { ok: true, submitted: false };
}

function emails_(sh) {
  return sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
}

/* Turn a sheet row back into the shape the site stores, so a serdik who
   already submitted sees their own answers (read-only) on any device. */
function rowToRecord_(r) {
  const num = v => (v === "" || v === null) ? null : Number(v);
  const o = 6;
  const picksText = String(r[o + N_N + N_S] || "");
  return {
    submitted: true,
    at: new Date(r[0]).toISOString(),
    nama: String(r[2]), grup: String(r[3]), elemen: String(r[4]), kelas: String(r[5]),
    n: r.slice(o, o + N_N).map(num),
    s: r.slice(o + N_N, o + N_N + N_S).map(num),
    picks: SOFT_LABELS.map((l, k) => picksText.indexOf(l) >= 0 ? k : -1).filter(k => k >= 0)
  };
}

function scale_(arr, n, max, what) {
  if (!Array.isArray(arr) || arr.length !== n) fail_("invalid", "Jumlah jawaban " + what + " tidak sesuai. Muat ulang halaman lalu coba lagi.");
  return arr.map(v => {
    const x = Number(v);
    if (v === null || v === "" || !(x >= 1 && x <= max && Math.floor(x) === x)) fail_("invalid", "Masih ada " + what + " yang belum dijawab atau di luar skala 1 sampai " + max + ".");
    return x;
  });
}

function picks_(arr) {
  if (!Array.isArray(arr)) fail_("invalid", "Pilih tepat 3 soft skill.");
  const ks = arr.map(Number);
  const uniq = ks.filter((k, i) => ks.indexOf(k) === i);
  if (uniq.length !== N_PICK || uniq.length !== ks.length || uniq.some(k => !(k >= 0 && k < N_S && Math.floor(k) === k))) fail_("invalid", "Pilih tepat 3 soft skill yang berbeda.");
  return uniq.sort((a, b) => a - b);
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

/* Run once from the editor to create the sheet tab and grant permissions. */
function setup() {
  sheet_();
  UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=x", { muteHttpExceptions: true });
}
