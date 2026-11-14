// Data Asisten Fisika: materi dipecah per TOPIK (chunk) + kata kunci pencocokan.
// Teks materi tidak diubah, hanya dipecah dari client/materi-data.js.
// PRD: PRD-agent-pembuat-chatbot.md (Tahap 1)
import { BAB } from "./materi-data.js";

// Kata kunci per topik: nama topik, simbol/rumus utama, dan sinonim bahasa Indonesia.
// Kunci harus sama persis dengan `nama` pada client/materi-data.js.
const KATA_KUNCI = {
  // Bab 1
  Kecepatan: ["kecepatan", "kelajuan", "laju", "velocity", "perpindahan per waktu"],
  Percepatan: ["percepatan", "akselerasi", "acceleration", "perubahan kecepatan"],
  "GLB & GLBB": ["glb", "glbb", "gerak lurus", "percepatan konstan", "kinematika", "gerak lurus berubah"],
  Gravitasi: ["gravitasi", "gaya tarik", "berat", "gravity", "percepatan gravitasi", "massa benda"],
  "Jatuh Bebas": ["jatuh bebas", "jatuh", "dijatuhkan", "free fall", "waktu jatuh", "ketinggian"],
  "Gerak Proyektil": ["proyektil", "parabola", "gerak parabola", "jangkauan", "tinggi maksimum", "sudut elevasi", "projectile"],
  Gaya: ["gaya", "resultan", "force", "dorongan", "tarikan"],
  "Hukum Newton": ["newton", "inersia", "aksi reaksi", "hukum newton", "kelembaman"],
  "Gaya Gesek": ["gesek", "gesekan", "kinetis", "statis", "koefisien gesek", "friction"],
  // Bab 2
  Usaha: ["usaha", "kerja", "work", "joule"],
  "Energi Kinetik": ["energi kinetik", "kinetik", "ek", "mv", "energi gerak", "kinetic"],
  "Energi Potensial": ["energi potensial", "potensial", "ep", "mgh", "energi ketinggian"],
  "Kekekalan Energi Mekanik": ["kekekalan", "energi mekanik", "tanpa gesek", "teorema usaha energi", "usaha dan energi"],
  Daya: ["daya", "watt", "power", "laju usaha"],
  "Momentum & Impuls": ["momentum", "impuls", "impulse", "kesulitan menghentikan"],
  Tumbukan: ["tumbukan", "tabrakan", "lenting", "menyatu", "collision", "restitusi"],
  // Bab 3
  "Arus Listrik": ["arus", "ampere", "current", "aliran muatan"],
  Tegangan: ["tegangan", "beda potensial", "volt", "voltage", "potensial listrik"],
  "Hambatan & Hukum Ohm": ["hambatan", "ohm", "resistor", "resistansi", "ohmik", "hukum ohm"],
  "Rangkaian Seri": ["seri", "rangkaian seri", "disusun seri", "tegangan terbagi"],
  "Rangkaian Paralel": ["paralel", "paralel", "bercabang", "parallel", "hambatan total"],
  "Daya Listrik": ["daya listrik", "kwh", "energi listrik", "watt listrik", "vi"],
  "Hukum Kirchhoff": ["kirchhoff", "kcl", "kvl", "titik cabang", "loop", "arus masuk"],
  "Hukum Coulomb": ["coulomb", "muatan", "tolak menolak", "tarik menarik", "gaya listrik"],
  // Bab 4
  "Frekuensi & Periode": ["frekuensi", "periode", "hertz", "hz", "getaran", "period"],
  "Cepat Rambat Gelombang": ["cepat rambat", "gelombang", "panjang gelombang", "lambda", "rambat", "gelombang bunyi"],
  "Efek Doppler": ["doppler", "sirene", "frekuensi terdengar", "mendekat", "menjauh"],
  // Bab 5
  Cermin: ["cermin", "cekung", "cembung", "pemantulan", "bayangan", "mirror"],
  "Lensa Cembung": ["lensa", "konvergen", "lup", "kaca pembesar", "bayangan lensa", "lens"],
  "Indeks Bias & Snell": ["indeks bias", "snell", "pembiasan", "bias", "refraksi", "refraction"],
  // Bab 6
  Magnet: ["magnet", "medan magnet", "gaya magnet", "tesla", "kutub", "elektromagnet", "lorentz"],
  "Pegas (Hooke)": ["pegas", "hooke", "konstanta pegas", "elastis", "spring"],
  Bandul: ["bandul", "ayunan", "pendulum", "ayunan sederhana"],
  "Fluida & Tekanan": ["fluida", "tekanan", "hidrostatis", "pascal", "kedalaman", "pressure", "dongkrak"],
  "Gaya Apung (Archimedes)": ["apung", "archimedes", "terapung", "tenggelam", "melayang", "gaya apung"],
  Vektor: ["vektor", "skalar", "komponen", "arah", "vector", "perpindahan"],
  "Satuan SI": ["satuan", "konversi", "awalan", "meter", "kilogram", "internasional"],
};

// Normalisasi teks untuk pencocokan: huruf kecil, tanpa tanda baca/aksen.
export function normalisasi(teks) {
  return String(teks ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function kataKunciTopik(nama, tambahan) {
  const dasar = [normalisasi(nama)];
  const daftar = [...dasar, ...(tambahan ?? []).map(normalisasi)];
  const unik = [];
  for (const kata of daftar) {
    if (kata && !unik.includes(kata)) unik.push(kata);
  }
  return unik;
}

function isiTopik(topik) {
  return [
    "Pengertian: " + topik.pengertian,
    "Rumus: " + topik.rumus,
    "Contoh: " + topik.contoh,
  ].join("\n");
}

// CHUNKS: satu entri per topik materi.
export const CHUNKS = BAB.flatMap((bab) =>
  bab.topik.map((topik) => ({
    id: bab.id + "-" + normalisasi(topik.nama).replace(/\s+/g, "-"),
    bab: bab.judul,
    topik: topik.nama,
    kata_kunci: kataKunciTopik(topik.nama, KATA_KUNCI[topik.nama]),
    isi: isiTopik(topik),
  })),
);

// DAFTAR_TOPIK: satu baris per topik, dipakai sebagai batas materi di system prompt.
export const DAFTAR_TOPIK = CHUNKS.map((chunk) => "- " + chunk.topik + " (" + chunk.bab + ")");

// Semua teks chunk (untuk mengukur penghematan token di mode debug).
export const TOTAL_KARAKTER_MATERI = CHUNKS.reduce((total, chunk) => total + chunk.isi.length, 0);

// Perkiraan panjang prompt bila SELURUH materi dikirim setiap request (versi lama).
export const TOTAL_KARAKTER_PENUH = TOTAL_KARAKTER_MATERI + DAFTAR_TOPIK.join("\n").length;
