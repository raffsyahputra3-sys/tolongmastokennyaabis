// Fitur Asisten Fisika: chatbot hemat token (retrieval chunk + template jawaban).
// PRD: PRD-agent-pembuat-chatbot.md + PRD-efisiensi-jawaban-template.md
import { CHUNKS, DAFTAR_TOPIK, TOTAL_KARAKTER_MATERI, normalisasi } from "./asisten-data.js";

const CONFIG = {
  // DEBUG: tampilkan jenis pertanyaan, chunk terpilih, panjang prompt, dan usage token.
  DEBUG: new URLSearchParams(globalThis.location?.search ?? "").has("asistenDebug"),
  ENDPOINT: "/api/asisten",
  MAX_HISTORY: 6,
  MAX_CHUNK: 3,
  CACHE_PREFIX: "fisbot:",
  DEBUG_KEY: "fisbot:debug",
};

try {
  if (globalThis.localStorage?.getItem(CONFIG.DEBUG_KEY) === "1") CONFIG.DEBUG = true;
} catch {
  // localStorage may be unavailable.
}

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
    "Kamu adalah asisten belajar Fisika di game Logicodix. Jawab dalam bahasa Indonesia santai, singkat, dan jelas.",
    "Gunakan HANYA isi MATERI RELEVAN di bawah. Jangan memakai pengetahuan lain, jangan mengarang rumus, angka, satuan, atau contoh. Rumus ditulis persis seperti materi.",
    "Kalau MATERI RELEVAN kosong, jangan menjelaskan apa pun: ikuti saja instruksi format di bagian akhir.",
    "Tulis jawaban sebagai teks biasa, tanpa Markdown (jangan pakai **, #, atau bullet -) dan tanpa LaTeX (jangan pakai $, \\frac, atau \\[ \\]). Contoh benar: Ek = ½mv².",
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
    const raw = window.localStorage?.getItem(kunciCache(teks));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data?.jawaban === "string" ? data : null;
  } catch {
    return null;
  }
}

function tulisCache(teks, data) {
  try {
    window.localStorage?.setItem(kunciCache(teks), JSON.stringify(data));
  } catch {
    // Cache opsional; abaikan bila storage penuh/tidak tersedia.
  }
}

function hapusCache(teks) {
  try {
    window.localStorage?.removeItem(kunciCache(teks));
  } catch {
    // Ignore.
  }
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

/* ---------------- Rapikan format jawaban (teks biasa, tanpa Markdown/LaTeX) ---------------- */

export function rapikanJawaban(teks) {
  return String(teks ?? "")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\mathrm\{([^{}]*)\}/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\\/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------------- Jawaban lokal tanpa API ---------------- */
// T6 ("tidak jelas") dijawab di klien: hasilnya selalu sama, tidak perlu token,
// dan tidak berisiko model menjelaskan materi padahal pertanyaannya belum jelas.
const CONTOH_TOPIK_T6 = ["Hukum Newton", "Energi Kinetik", "Rangkaian Paralel"];

export function jawabanLokal(jenis) {
  if (jenis !== "T6") return null;
  return "Maksudmu topik yang mana? Coba tanya:\n• " + CONTOH_TOPIK_T6.join("\n• ");
}

/* ---------------- Panggilan API lewat server game ---------------- */

async function tanyaServer(messages, jenis) {
  const template = TEMPLATE[jenis] ?? TEMPLATE.T1;
  const res = await fetch(CONFIG.ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      max_tokens: template.maxTokens,
      temperature: template.temperature,
    }),
  });
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

/* ---------------- UI ---------------- */

const SARAN = [
  "Jelaskan Hukum Newton",
  "Rumus energi kinetik",
  "Cara hitung rangkaian paralel",
  "Apa itu efek Doppler?",
];

let els = null;
let riwayat = [];
let chunkTerakhir = null;
let gambarSiap = null;
let sibuk = false;

function tambahPesan(role, teks, gambar) {
  const bubble = document.createElement("div");
  bubble.className = "asisten-msg " + (role === "user" ? "me" : "bot");
  if (gambar) {
    const img = document.createElement("img");
    img.src = gambar;
    img.alt = "Gambar soal";
    bubble.appendChild(img);
  }
  const body = document.createElement("div");
  body.className = "asisten-text";
  body.textContent = teks;
  bubble.appendChild(body);
  els.log.appendChild(bubble);
  els.log.scrollTop = els.log.scrollHeight;
  return body;
}

function tambahCatatanDebug(teks) {
  const note = document.createElement("div");
  note.className = "asisten-debug";
  note.textContent = teks;
  els.log.appendChild(note);
  els.log.scrollTop = els.log.scrollHeight;
}

function tambahJawabUlang(teksPertanyaan, teksGambar) {
  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.className = "asisten-ulang";
  tombol.textContent = "Jawab ulang";
  tombol.addEventListener("click", () => {
    hapusCache(teksPertanyaan);
    tombol.disabled = true;
    kirimPertanyaan(teksPertanyaan, teksGambar, { lewatiCache: true, ulang: true });
  });
  els.log.appendChild(tombol);
  els.log.scrollTop = els.log.scrollHeight;
}

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
    tambahPesan("bot", cache.jawaban);
    if (CONFIG.DEBUG) tambahCatatanDebug("dari cache · jenis " + cache.jenis + " · prompt " + cache.promptKarakter + " karakter");
    tambahJawabUlang(isi, null);
    riwayat.push({ role: "user", content: isi }, { role: "assistant", content: cache.jawaban });
    riwayat = riwayat.slice(-CONFIG.MAX_HISTORY);
    return;
  }

  const chunks = pilihChunk(isi, chunkTerakhir);
  const jenis = jenisPertanyaan(isi, Boolean(gambar), chunks.length > 0);
  if (chunks.length > 0) chunkTerakhir = chunks[0];

  const lokal = jawabanLokal(jenis);
  if (lokal) {
    tambahPesan("bot", lokal);
    if (CONFIG.DEBUG) tambahCatatanDebug(jenis + " (" + TEMPLATE[jenis].nama + ") · dijawab lokal tanpa API");
    tulisCache(isi, { jawaban: lokal, jenis, promptKarakter: 0, at: Date.now() });
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

  const tunggu = tambahPesan("bot", "Sebentar, lagi mikir...");
  sibuk = true;
  els.send.disabled = true;

  try {
    const { teks: jawaban, usage } = await tanyaServer(messages, jenis);
    tunggu.textContent = jawaban;
    riwayat.push({ role: "user", content: isi || "(mengirim gambar soal)" }, { role: "assistant", content: jawaban });
    riwayat = riwayat.slice(-CONFIG.MAX_HISTORY);

    if (!gambar) {
      tulisCache(isi, { jawaban, jenis, promptKarakter: system.length, at: Date.now() });
    }

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
      if (window.console?.log) {
        console.log("[asisten] system prompt", jenis, system.length, "karakter\n" + system);
      }
    }
  } catch (error) {
    tunggu.classList.add("err");
    tunggu.textContent = "Gagal: " + (error?.message ?? "tidak diketahui") + ". Coba kirim ulang.";
  } finally {
    sibuk = false;
    els.send.disabled = false;
    els.log.scrollTop = els.log.scrollHeight;
    els.input.focus?.();
  }
}

function open() {
  if (!els) return;
  els.overlay.classList.remove("hidden");
  els.input.focus?.();
  els.log.scrollTop = els.log.scrollHeight;
}

function close() {
  els?.overlay.classList.add("hidden");
}

export function initAsisten() {
  const overlay = document.getElementById("asistenOverlay");
  const openBtn = document.getElementById("asistenBtn");
  if (!overlay || !openBtn) return;

  overlay.innerHTML =
    '<div class="belajar-shell asisten-shell">' +
      '<aside class="asisten-side">' +
        '<div class="belajar-head">' +
          '<div><span class="eyebrow">BELAJAR</span><h2>ASISTEN FISIKA</h2><p class="belajar-sub">tanya materi, atau kirim foto soal</p></div>' +
          '<button class="belajar-close" type="button" data-close aria-label="Tutup">✕</button>' +
        '</div>' +
        '<div class="asisten-tips">' +
          '<p class="asisten-tip-title">Contoh pertanyaan</p>' +
          '<div class="asisten-chips"></div>' +
        '</div>' +
        '<p class="asisten-note">Jawaban hanya memakai materi game (6 bab). Di luar itu asisten menawarkan topik terdekat.</p>' +
      '</aside>' +
      '<main class="asisten-main">' +
        '<div class="asisten-log" aria-live="polite"></div>' +
        '<form class="asisten-form">' +
          '<button type="button" class="asisten-pick" aria-label="Kirim gambar soal">📷</button>' +
          '<input type="file" class="asisten-file" accept="image/*" hidden>' +
          '<input class="asisten-input" placeholder="Tulis pertanyaan fisika..." autocomplete="off">' +
          '<button class="mini-btn accent asisten-send" type="submit">KIRIM</button>' +
        '</form>' +
        '<p class="asisten-preview hidden"></p>' +
      '</main>' +
    '</div>';

  const chips = overlay.querySelector(".asisten-chips");
  for (const saran of SARAN) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "asisten-chip";
    tombol.textContent = saran;
    tombol.addEventListener("click", () => {
      els.input.value = saran;
      kirimPertanyaan(saran, null);
    });
    chips.appendChild(tombol);
  }

  els = {
    overlay,
    log: overlay.querySelector(".asisten-log"),
    form: overlay.querySelector(".asisten-form"),
    input: overlay.querySelector(".asisten-input"),
    send: overlay.querySelector(".asisten-send"),
    file: overlay.querySelector(".asisten-file"),
    pick: overlay.querySelector(".asisten-pick"),
    preview: overlay.querySelector(".asisten-preview"),
  };

  els.pick.addEventListener("click", () => els.file.click());
  els.file.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    els.preview.textContent = "Menyiapkan gambar...";
    els.preview.classList.remove("hidden");
    try {
      gambarSiap = await siapkanGambar(file);
      els.preview.textContent = "📎 Gambar siap dikirim: " + file.name;
    } catch (error) {
      gambarSiap = null;
      els.preview.textContent = "Gagal membaca gambar: " + error.message;
    }
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    kirimPertanyaan(els.input.value, gambarSiap);
  });

  openBtn.addEventListener("click", open);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) close();
  });

  tambahPesan(
    "bot",
    "Halo! Aku Asisten Fisika. Tanya apa saja dari materi game, atau kirim foto soal lewat tombol 📷.",
  );
}
