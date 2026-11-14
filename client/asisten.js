// Fitur Asisten Fisika (Fisiko): chatbot hemat token (retrieval chunk + template jawaban).
// PRD: PRD-agent-pembuat-chatbot.md + PRD-efisiensi-jawaban-template.md
import { CHUNKS, DAFTAR_TOPIK, TOTAL_KARAKTER_MATERI, normalisasi } from "./asisten-data.js";
import { serverHttpBase } from "./net.js";

const CONFIG = {
  // DEBUG: tampilkan jenis pertanyaan, chunk terpilih, panjang prompt, dan usage token.
  DEBUG: new URLSearchParams(globalThis.location?.search ?? "").has("asistenDebug"),
  MAX_HISTORY: 6,
  MAX_CHUNK: 3,
  CACHE_PREFIX: "fisbot:",
  DEBUG_KEY: "fisbot:debug",
};

const JALUR_ASISTEN = "/api/asisten";
// Server gratis bisa "tidur" saat lama tak dipakai, jadi beri waktu bangun
// tapi jangan menggantung tanpa batas.
const BATAS_TUNGGU_MS = 90_000;

// Di APK native halaman dilayani dari perangkat, jadi alamat relatif akan
// menyasar HP sendiri. serverHttpBase() mengembalikan alamat server game.
function endpointAsisten() {
  return serverHttpBase() + JALUR_ASISTEN;
}

try {
  if (globalThis.localStorage?.getItem(CONFIG.DEBUG_KEY) === "1") CONFIG.DEBUG = true;
} catch {
  // localStorage may be unavailable.
}

const SARAN = [
  "Jelaskan Hukum Newton",
  "Rumus energi kinetik",
  "Cara hitung rangkaian paralel",
  "Apa itu efek Doppler?",
];

// Maskot Fisiko: rubah oranye dengan orbit elektron kecil.
const FOX_SVG =
  '<svg class="fisiko-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<ellipse cx="50" cy="52" rx="48" ry="13" fill="none" stroke="#60a5fa" stroke-opacity=".45" stroke-width="1.5" transform="rotate(-20 50 52)"/>' +
  '<path d="M72 82 Q104 84 97 50 Q89 68 70 68 Z" fill="#f97316"/>' +
  '<path d="M97 50 Q94 60 88 64 Q98 63 97 50 Z" fill="#fff7ed"/>' +
  '<polygon points="16,42 22,6 47,28" fill="#f97316"/>' +
  '<polygon points="84,42 78,6 53,28" fill="#f97316"/>' +
  '<polygon points="23,36 26,16 38,28" fill="#7c2d12"/>' +
  '<polygon points="77,36 74,16 62,28" fill="#7c2d12"/>' +
  '<path d="M50 90 L12 54 Q8 36 28 30 Q50 22 72 30 Q92 36 88 54 Z" fill="#fb923c"/>' +
  '<path d="M50 90 L12 54 Q30 64 50 60 Q70 64 88 54 Z" fill="#fff7ed"/>' +
  '<polygon points="52,30 45,42 50,42 47,52 56,38 51,38" fill="#fde047"/>' +
  '<g class="fisiko-eyes">' +
  '<g class="fisiko-eye"><circle cx="34" cy="50" r="5" fill="#1e293b"/><circle cx="35.5" cy="48.3" r="1.6" fill="#fff"/></g>' +
  '<g class="fisiko-eye"><circle cx="66" cy="50" r="5" fill="#1e293b"/><circle cx="67.5" cy="48.3" r="1.6" fill="#fff"/></g>' +
  "</g>" +
  '<ellipse cx="50" cy="73" rx="4" ry="3" fill="#1e293b"/>' +
  '<ellipse class="fisiko-mouth" cx="50" cy="80" rx="4" ry="1.4" fill="#7c2d12"/>' +
  '<circle r="3" fill="#60a5fa">' +
  '<animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto" path="M2 52 a48 13 0 1 0 96 0 a48 13 0 1 0 -96 0"/>' +
  "</circle></svg>";

/* ---------------- Template jawaban (PRD 5.4 & 5.5) ---------------- */

const TEMPLATE = {
  T1: {
    nama: "Konsep",
    maxTokens: 250,
    temperature: 0.4,
    instruksi:
      "Format balasan (konsep), maksimal 4 kalimat: definisi inti, lalu satu rumus bila ada, lalu satu contoh yang diambil persis dari baris 'Contoh:' pada materi relevan. Jangan membuat angka atau contoh baru. Tanpa pembuka basa-basi.",
  },
  T2: {
    nama: "Rumus",
    maxTokens: 250,
    temperature: 0.4,
    instruksi:
      "Format balasan (rumus): baris 'Rumus:' berisi rumus persis dari materi, baris 'Keterangan:' berisi arti tiap simbol dan satuannya, lalu satu contoh singkat.",
  },
  T3: {
    nama: "Hitungan",
    maxTokens: 450,
    temperature: 0.2,
    instruksi:
      "Format balasan (hitungan), urut dan berlabel: 'Diketahui:', 'Ditanya:', 'Rumus:', 'Hitung:' (substitusi angka), lalu 'Jawab:' hasil beserta satuan. Hitung dengan teliti.",
  },
  T4: {
    nama: "Soal bergambar",
    maxTokens: 450,
    temperature: 0.2,
    instruksi:
      "Format balasan (soal bergambar): mulai dengan 'Terbaca dari gambar:' berisi teks dan angka yang kamu baca dari gambar, lalu lanjutkan dengan format hitungan ('Diketahui:', 'Ditanya:', 'Rumus:', 'Hitung:', 'Jawab:'). Jika ada angka yang tidak terbaca, sebutkan dan minta foto ulang; jangan menebak angka.",
  },
  T5: {
    nama: "Di luar materi",
    maxTokens: 120,
    temperature: 0.4,
    instruksi:
      "Format balasan (di luar materi) — WAJIB dipatuhi: JANGAN menjawab pertanyaan pengguna dan JANGAN menjelaskan topiknya, meskipun kamu tahu jawabannya. Balas tepat dua bagian: (1) satu kalimat 'Topik itu belum ada di materi game ini.' (2) baris 'Coba topik ini: ' diikuti maksimal 2 topik yang disalin persis dari DAFTAR TOPIK.",
  },
  T6: {
    nama: "Tidak jelas",
    maxTokens: 120,
    temperature: 0.4,
    instruksi:
      "Format balasan (tidak jelas): JANGAN menjelaskan materi dan jangan langsung menjawab. Baris pertama WAJIB sebuah pertanyaan klarifikasi singkat yang diakhiri tanda tanya, lalu baris 'Coba tanya: ' diikuti 3 topik yang disalin persis dari DAFTAR TOPIK.",
  },
};

/* ---------------- Retrieval ringan (PRD 5.2) ---------------- */

function cocok(kunci, bersih, tokens) {
  if (kunci.includes(" ")) return bersih.includes(kunci);
  if (kunci.length >= 5) return bersih.includes(kunci);
  return tokens.has(kunci);
}

function pesanLanjutan(bersih) {
  const kata = bersih.split(" ").filter(Boolean);
  if (kata.length === 0 || kata.length > 4) return false;
  return /^(lanjut|lanjutkan|terus|trus|kenapa|kok|mengapa|maksudnya|gimana|bagaimana|jelaskan lagi|contohnya|terus gimana)/.test(
    bersih,
  );
}

export function pilihChunk(pertanyaan, chunkTerakhir = null) {
  const bersih = normalisasi(pertanyaan);
  const tokens = new Set(bersih.split(" ").filter(Boolean));
  const hasil = [];
  for (const chunk of CHUNKS) {
    let skor = 0;
    for (const kunci of chunk.kata_kunci) {
      if (cocok(kunci, bersih, tokens)) {
        skor += kunci.includes(" ") ? 3 : Math.max(1, Math.min(3, Math.floor(kunci.length / 3)));
      }
    }
    if (skor > 0) hasil.push({ chunk, skor });
  }
  hasil.sort((a, b) => b.skor - a.skor);
  if (hasil.length > 0) return hasil.slice(0, CONFIG.MAX_CHUNK).map((item) => item.chunk);
  if (pesanLanjutan(bersih) && chunkTerakhir) return [chunkTerakhir];
  return [];
}

/* ---------------- Klasifikasi jenis pertanyaan (PRD 5.3) ---------------- */

const RE_SATUAN =
  /(^|\s)(m|cm|mm|km|kg|g|mg|s|ms|a|v|n|j|w|hz|khz|c|pa|kpa|kwh|t|ω|ohm|μc|nc|liter|ml|km\/jam|m\/s|m\/s²|m\/s2)(\s|$|[.,?!])/;
const RE_TANYA = /(^|\s)(berapa|hitung|tentukan|nilai|cari)(\s|$)/;

function adaAngkaSatuan(teks) {
  const t = " " + String(teks).toLowerCase() + " ";
  if (!/\d/.test(t)) return false;
  return RE_TANYA.test(t) || RE_SATUAN.test(t);
}

export function jenisPertanyaan(teks, adaGambar, adaChunk) {
  if (adaGambar) return "T4";
  const bersih = normalisasi(teks);
  const jumlahKata = bersih.split(" ").filter(Boolean).length;
  if (!adaChunk) return jumlahKata < 3 ? "T6" : "T5";
  if (adaAngkaSatuan(teks)) return "T3";
  if (/(^|\s)(rumus|persamaan)(\s|$)/.test(bersih)) return "T2";
  return "T1";
}

/* ---------------- Rakit system prompt (PRD Tahap 3) ---------------- */

export function rakitSystemPrompt(jenis, chunks, teks = "") {
  const template = TEMPLATE[jenis] ?? TEMPLATE.T1;
  const bagian = [
    "Kamu adalah Fisiko, rubah pintar yang menjadi asisten belajar Fisika di game GatraVolt. Jawab dalam bahasa Indonesia santai, singkat, dan jelas.",
    "Gunakan HANYA isi MATERI RELEVAN di bawah. Jangan memakai pengetahuan lain, jangan mengarang rumus, angka, satuan, atau contoh. Rumus ditulis persis seperti materi.",
    "Kalau MATERI RELEVAN kosong, jangan menjelaskan apa pun: ikuti saja instruksi format di bagian akhir.",
    "Tulis jawaban sebagai teks biasa (boleh menebalkan dengan **dua bintang**), tanpa LaTeX (jangan pakai $, \\frac, atau \\[ \\]).",
    "DAFTAR TOPIK MATERI (batas materi game ini):",
    DAFTAR_TOPIK.join("\n"),
  ];
  if (chunks.length > 0) {
    bagian.push(
      "MATERI RELEVAN:\n" +
        chunks.map((chunk) => "[" + chunk.topik + " — " + chunk.bab + "]\n" + chunk.isi).join("\n\n"),
    );
  } else {
    bagian.push("MATERI RELEVAN: (tidak ada topik yang cocok dengan pertanyaan)");
  }
  if (jenis === "T6") bagian.push("Pertanyaan pengguna: " + JSON.stringify(String(teks ?? "")));
  bagian.push(template.instruksi);
  return bagian.join("\n\n");
}

/* ---------------- Cache jawaban (PRD 5.6) ---------------- */

function kunciCache(teks) {
  return CONFIG.CACHE_PREFIX + normalisasi(teks);
}

function bacaCache(teks) {
  try {
    const raw = globalThis.localStorage?.getItem(kunciCache(teks));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data?.jawaban === "string" ? data : null;
  } catch {
    return null;
  }
}

function tulisCache(teks, data) {
  try {
    globalThis.localStorage?.setItem(kunciCache(teks), JSON.stringify(data));
  } catch {
    // Cache opsional; abaikan bila storage penuh/tidak tersedia.
  }
}

function hapusCache(teks) {
  try {
    globalThis.localStorage?.removeItem(kunciCache(teks));
  } catch {
    // Ignore.
  }
}

/* ---------------- Bersihkan & format jawaban ---------------- */

// Buang sisa penanda LaTeX, sisakan penebalan ** dan `kode` untuk dirender.
export function rapikanJawaban(teks) {
  return String(teks ?? "")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\mathrm\{([^{}]*)\}/g, "$1")
    .replace(/\\/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Aman: escape HTML dulu, baru izinkan **tebal** dan `kode`.
export function formatJawaban(teks) {
  return String(teks ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*(?!\*)([^*\n]*[A-Za-z][^*\n]*)\*/g, "<strong>$1</strong>");
}

/* ---------------- Jawaban lokal tanpa API ---------------- */
// T6 ("tidak jelas") dijawab di klien: hasilnya selalu sama, tidak perlu token,
// dan tidak berisiko model menjelaskan materi padahal pertanyaannya belum jelas.
const CONTOH_TOPIK_T6 = ["Hukum Newton", "Energi Kinetik", "Rangkaian Paralel"];

export function jawabanLokal(jenis) {
  if (jenis !== "T6") return null;
  return "Maksudmu topik yang mana? Coba tanya:\n• " + CONTOH_TOPIK_T6.join("\n• ");
}

/* ---------------- Kompres gambar soal agar hemat token ---------------- */

async function siapkanGambar(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gambar tidak bisa dibuka."));
      img.src = dataUrl;
    });
    const maks = 1280;
    const skala = Math.min(1, maks / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * skala));
    canvas.height = Math.max(1, Math.round(image.height * skala));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

/* ---------------- Panggilan API lewat server game ---------------- */

async function tanyaServer(messages, jenis) {
  const template = TEMPLATE[jenis] ?? TEMPLATE.T1;
  const pembatal = new AbortController();
  const jam = setTimeout(() => pembatal.abort(), BATAS_TUNGGU_MS);
  let res;
  try {
    res = await fetch(endpointAsisten(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: pembatal.signal,
      body: JSON.stringify({
        messages,
        max_tokens: template.maxTokens,
        temperature: template.temperature,
      }),
    });
  } catch {
    throw new Error(
      pembatal.signal.aborted
        ? "server terlalu lama merespons, coba lagi"
        : "server asisten tidak terjangkau",
    );
  } finally {
    clearTimeout(jam);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(data?.error || "HTTP " + res.status);
  const teks = rapikanJawaban(data?.text);
  if (!teks) throw new Error("Asisten tidak mengirim jawaban.");
  return { teks, usage: data?.usage ?? null };
}

/* ---------------- UI: maskot Fisiko ---------------- */

let els = null;
let riwayat = [];
let chunkTerakhir = null;
let gambarSiap = null;
let sibuk = false;
let timerIdle = null;
// Diisi initAsisten(): menyelaraskan tinggi panel dengan area yang terlihat.
let syncTinggi = () => {};

// Gulirkan daftar pesan ke pesan terakhir (dipakai saat kirim/terima dan saat
// keyboard HP muncul, supaya jawaban tidak tersembunyi di balik keyboard).
function turunkanKeBawah() {
  if (!els?.log) return;
  els.log.scrollTop = els.log.scrollHeight;
}

function fisikoSay(state, teks, ms) {
  if (!els) return;
  clearTimeout(timerIdle);
  els.mascot.dataset.state = state;
  if (teks) els.bubble.textContent = teks;
  if (ms) {
    timerIdle = window.setTimeout(() => {
      els.mascot.dataset.state = "idle";
      els.bubble.textContent = "Ada yang mau ditanya?";
    }, ms);
  }
}

function tambahPesan(role, teks, gambar) {
  const row = document.createElement("div");
  row.className = "fisiko-row " + (role === "user" ? "me" : "bot");
  if (role !== "user") {
    const avatar = document.createElement("div");
    avatar.className = "fisiko-av";
    avatar.textContent = "🦊";
    row.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "fisiko-msg";
  if (gambar) {
    const img = document.createElement("img");
    img.src = gambar;
    img.alt = "Gambar soal";
    bubble.appendChild(img);
  }
  const body = document.createElement("div");
  body.className = "fisiko-text";
  bubble.appendChild(body);
  row.appendChild(bubble);
  els.log.appendChild(row);

  // Tipe balasan: teks biasa (aman) atau HTML yang sudah diformat.
  body.textContent = teks;
  turunkanKeBawah();
  return body;
}

function tambahTitikTunggu() {
  const tunggu = tambahPesan("bot", "");
  tunggu.classList.add("fisiko-q");
  tunggu.innerHTML = '<span class="fisiko-dots"><i></i><i></i><i></i></span>';
  return tunggu;
}

function tambahCatatanDebug(teks) {
  const note = document.createElement("div");
  note.className = "fisiko-debug";
  note.textContent = teks;
  els.log.appendChild(note);
  turunkanKeBawah();
}

function tambahJawabUlang(teksPertanyaan) {
  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.className = "fisiko-ulang";
  tombol.textContent = "Jawab ulang";
  tombol.addEventListener("click", () => {
    hapusCache(teksPertanyaan);
    tombol.disabled = true;
    kirimPertanyaan(teksPertanyaan, null, { lewatiCache: true, ulang: true });
  });
  els.log.appendChild(tombol);
  turunkanKeBawah();
}

function tampilkanJawaban(elemen, teks) {
  elemen.classList.remove("fisiko-q");
  elemen.innerHTML = formatJawaban(teks);
}

/* ---------------- UI: alur tanya jawab ---------------- */

async function kirimPertanyaan(teks, gambar, opsi = {}) {
  if (sibuk) return;
  const isi = String(teks ?? "").trim();
  if (!isi && !gambar) return;

  if (opsi.ulang) {
    // buang giliran terakhir (pertanyaan + jawaban cache) agar tidak terkirim dua kali
    while (riwayat.length > 0 && riwayat[riwayat.length - 1].role !== "user") riwayat.pop();
    if (riwayat.length > 0) riwayat.pop();
  } else {
    tambahPesan("user", isi || "(gambar soal)", gambar);
  }

  els.input.value = "";
  gambarSiap = null;
  els.preview.textContent = "";
  els.preview.classList.add("hidden");
  els.file.value = "";

  const cache = gambar || opsi.lewatiCache ? null : bacaCache(isi);
  if (cache) {
    tampilkanJawaban(tambahPesan("bot", ""), cache.jawaban);
    if (CONFIG.DEBUG) tambahCatatanDebug("dari cache · jenis " + cache.jenis + " · prompt " + cache.promptKarakter + " karakter");
    tambahJawabUlang(isi);
    fisikoSay("talking", "Ini yang tadi ya!", 2200);
    riwayat.push({ role: "user", content: isi }, { role: "assistant", content: cache.jawaban });
    riwayat = riwayat.slice(-CONFIG.MAX_HISTORY);
    return;
  }

  const chunks = pilihChunk(isi, chunkTerakhir);
  const jenis = jenisPertanyaan(isi, Boolean(gambar), chunks.length > 0);
  if (chunks.length > 0) chunkTerakhir = chunks[0];

  const lokal = jawabanLokal(jenis);
  if (lokal) {
    tampilkanJawaban(tambahPesan("bot", ""), lokal);
    if (CONFIG.DEBUG) tambahCatatanDebug(jenis + " (" + TEMPLATE[jenis].nama + ") · dijawab lokal tanpa API");
    tulisCache(isi, { jawaban: lokal, jenis, promptKarakter: 0, at: Date.now() });
    fisikoSay("talking", "Maksudmu yang mana ya?", 2600);
    riwayat.push({ role: "user", content: isi }, { role: "assistant", content: lokal });
    riwayat = riwayat.slice(-CONFIG.MAX_HISTORY);
    return;
  }

  const system = rakitSystemPrompt(jenis, chunks, isi);
  const isiUser = gambar
    ? [
        { type: "text", text: isi || "Baca dan selesaikan soal pada gambar ini." },
        { type: "image_url", image_url: { url: gambar } },
      ]
    : isi;
  const messages = [
    { role: "system", content: system },
    ...riwayat.slice(-CONFIG.MAX_HISTORY),
    { role: "user", content: isiUser },
  ];

  const tunggu = tambahTitikTunggu();
  sibuk = true;
  els.send.disabled = true;
  fisikoSay("thinking", gambar ? "Aku baca gambarnya dulu..." : "Hmm, aku hitung dulu...");

  try {
    const { teks: jawaban, usage } = await tanyaServer(messages, jenis);
    tampilkanJawaban(tunggu, jawaban);
    riwayat.push({ role: "user", content: isi || "(mengirim gambar soal)" }, { role: "assistant", content: jawaban });
    riwayat = riwayat.slice(-CONFIG.MAX_HISTORY);

    if (!gambar) {
      tulisCache(isi, { jawaban, jenis, promptKarakter: system.length, at: Date.now() });
    }

    fisikoSay("talking", "Nih jawabannya!", Math.min(5000, Math.max(1800, jawaban.length * 25)));

    if (CONFIG.DEBUG) {
      const potong = Math.max(0, 100 - Math.round((system.length / Math.max(1, TOTAL_KARAKTER_MATERI)) * 100));
      const tokenInfo = usage?.prompt_tokens != null ? " · prompt_tokens " + usage.prompt_tokens : "";
      tambahCatatanDebug(
        jenis +
          " (" +
          TEMPLATE[jenis].nama +
          ") · chunk: " +
          (chunks.map((chunk) => chunk.topik).join(", ") || "-") +
          " · prompt " +
          system.length +
          " karakter (materi penuh " +
          TOTAL_KARAKTER_MATERI +
          ", hemat " +
          potong +
          "%)" +
          tokenInfo,
      );
      if (globalThis.console?.log) {
        console.log("[fisiko] system prompt", jenis, system.length, "karakter\n" + system);
      }
    }
  } catch (error) {
    tunggu.classList.remove("fisiko-q");
    tunggu.classList.add("err");
    tunggu.textContent = "Gagal: " + (error?.message ?? "tidak diketahui") + ". Coba kirim ulang.";
    fisikoSay("idle", "Waduh, koneksi bermasalah. Coba lagi ya!", 4000);
  } finally {
    sibuk = false;
    els.send.disabled = false;
    turunkanKeBawah();
    els.input.focus?.({ preventScroll: true });
  }
}

function open() {
  if (!els) return;
  els.overlay.classList.remove("hidden");
  syncTinggi();
  els.input.focus?.({ preventScroll: true });
  turunkanKeBawah();
  fisikoSay("idle", "Mau tanya apa hari ini?");
}

function close() {
  els?.overlay.classList.add("hidden");
}

export function initAsisten() {
  const overlay = document.getElementById("asistenOverlay");
  const openBtn = document.getElementById("asistenBtn");
  const lobbyBtn = document.getElementById("fisikoBtn");
  if (!overlay || (!openBtn && !lobbyBtn)) return;

  overlay.innerHTML =
    '<div class="fisiko-shell">' +
      '<div class="fisiko-symbols" aria-hidden="true">' +
        '<span style="top:6%;left:5%">F = ma</span>' +
        '<span style="top:20%;right:6%;animation-delay:-4s">E = mc²</span>' +
        '<span style="top:46%;left:2%;animation-delay:-8s">V = IR</span>' +
        '<span style="top:62%;right:4%;animation-delay:-2s">v = λf</span>' +
        '<span style="bottom:14%;left:10%;animation-delay:-6s">Ek = ½mv²</span>' +
        '<span style="bottom:26%;right:12%;animation-delay:-10s">P = ρgh</span>' +
      "</div>" +
      '<header class="fisiko-head">' +
        '<div class="fisiko-id" data-state="idle">' +
          '<div class="fisiko-fox-wrap">' +
            FOX_SVG +
            '<div class="fisiko-shadow"></div>' +
          "</div>" +
          '<div class="fisiko-info">' +
            '<div class="fisiko-name">Fisiko <span class="fisiko-live" title="Online"></span><span class="fisiko-role">Asisten Fisika</span></div>' +
            '<div class="fisiko-sub">Kinematika · Energi · Listrik · Gelombang · Optik · Magnet &amp; Fluida</div>' +
            '<div class="fisiko-bubble">Halo! Aku Fisiko 🦊</div>' +
          "</div>" +
          '<button class="belajar-close" type="button" data-close aria-label="Tutup">✕</button>' +
        "</div>" +
      "</header>" +
      '<div class="fisiko-log" aria-live="polite"></div>' +
      '<div class="fisiko-chips"></div>' +
      '<p class="fisiko-preview hidden"></p>' +
      '<form class="fisiko-form">' +
        '<button type="button" class="fisiko-pick" title="Kirim gambar soal" aria-label="Kirim gambar soal">📷</button>' +
        '<input type="file" class="fisiko-file" accept="image/*" hidden>' +
        '<input class="fisiko-input" placeholder="Tanya Fisiko soal fisika..." autocomplete="off">' +
        '<button class="fisiko-send" type="submit" aria-label="Kirim">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.5L15 12 3.39 13.9z"/></svg>' +
        "</button>" +
      "</form>" +
    "</div>";

  const chips = overlay.querySelector(".fisiko-chips");
  for (const saran of SARAN) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.textContent = saran;
    tombol.addEventListener("click", () => {
      els.input.value = saran;
      kirimPertanyaan(saran, null);
    });
    chips.appendChild(tombol);
  }

  els = {
    overlay,
    mascot: overlay.querySelector(".fisiko-id"),
    bubble: overlay.querySelector(".fisiko-bubble"),
    log: overlay.querySelector(".fisiko-log"),
    form: overlay.querySelector(".fisiko-form"),
    input: overlay.querySelector(".fisiko-input"),
    send: overlay.querySelector(".fisiko-send"),
    file: overlay.querySelector(".fisiko-file"),
    pick: overlay.querySelector(".fisiko-pick"),
    preview: overlay.querySelector(".fisiko-preview"),
  };

  // Keyboard HP tidak mengecilkan satuan 100vh, jadi tinggi panel diambil dari
  // window.visualViewport: panel menyusut mengikuti keyboard dan pesan terakhir
  // tetap terlihat. Nilainya dipakai lewat variabel CSS di ui2.css.
  syncTinggi = () => {
    const vv = window.visualViewport;
    overlay.style.setProperty("--fisiko-h", Math.round(vv ? vv.height : window.innerHeight) + "px");
    overlay.style.setProperty("--fisiko-top", Math.round(vv ? vv.offsetTop : 0) + "px");
    if (!overlay.classList.contains("hidden")) turunkanKeBawah();
  };
  syncTinggi();
  window.visualViewport?.addEventListener("resize", syncTinggi);
  window.visualViewport?.addEventListener("scroll", syncTinggi);
  window.addEventListener("orientationchange", () => setTimeout(syncTinggi, 250));

  // Avatar rubah di lobi: tombol besar agar gampang dilihat di dekat karakter game.
  if (lobbyBtn) {
    lobbyBtn.innerHTML =
      '<span class="fisiko-btn-bubble">Tanya aku! 🦊</span>' +
      '<span class="fisiko-btn-fox">' +
      FOX_SVG +
      '<span class="fisiko-btn-dot" aria-hidden="true"></span>' +
      "</span>" +
      '<span class="fisiko-btn-label">FISIKO<small>ASISTEN FISIKA</small></span>';
  }

  els.pick.addEventListener("click", () => els.file.click());
  els.file.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    els.preview.textContent = "Menyiapkan gambar...";
    els.preview.classList.remove("hidden");
    try {
      gambarSiap = await siapkanGambar(file);
      els.preview.textContent = "📎 Gambar siap dikirim: " + file.name;
      fisikoSay("idle", "Gambarnya sudah siap, kirim ya!");
    } catch (error) {
      gambarSiap = null;
      els.preview.textContent = "Gagal membaca gambar: " + error.message;
    }
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    kirimPertanyaan(els.input.value, gambarSiap);
  });

  openBtn?.addEventListener("click", open);
  lobbyBtn?.addEventListener("click", open);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) close();
  });

  const sapaan = tambahPesan("bot", "");
  tampilkanJawaban(sapaan, "Halo! Aku **Fisiko** 🦊, asisten Fisika kamu. Tanya apa saja dari materi game, atau kirim foto soal lewat tombol 📷.");
}
