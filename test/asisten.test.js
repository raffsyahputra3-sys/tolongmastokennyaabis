import test from "node:test";
import assert from "node:assert/strict";
import { CHUNKS, DAFTAR_TOPIK, TOTAL_KARAKTER_MATERI, TOTAL_KARAKTER_PENUH } from "../client/asisten-data.js";
import { formatJawaban, jenisPertanyaan, jawabanLokal, pilihChunk, rakitSystemPrompt, rapikanJawaban } from "../client/asisten.js";

function topikPertama(pertanyaan) {
  const chunks = pilihChunk(pertanyaan);
  return chunks[0]?.topik ?? null;
}

test("chunk materi mencakup semua topik dan daftar topik satu baris per topik", () => {
  assert.equal(CHUNKS.length, 37);
  assert.equal(DAFTAR_TOPIK.length, CHUNKS.length);
  for (const chunk of CHUNKS) {
    assert.ok(chunk.kata_kunci.length > 0, chunk.topik + " tanpa kata kunci");
    assert.ok(chunk.isi.includes("Pengertian:"), chunk.topik + " tanpa pengertian");
    assert.ok(chunk.isi.includes("Rumus:"), chunk.topik + " tanpa rumus");
  }
  assert.ok(TOTAL_KARAKTER_MATERI > 5000);
});

test("kasus 1: 'Jelaskan Hukum Newton' -> T1, chunk Hukum Newton", () => {
  const chunks = pilihChunk("Jelaskan Hukum Newton");
  assert.equal(chunks[0]?.topik, "Hukum Newton");
  assert.equal(jenisPertanyaan("Jelaskan Hukum Newton", false, chunks.length > 0), "T1");
  assert.ok(chunks[0].isi.includes("a=3 m/s²"));
});

test("kasus 2: 'Rumus energi kinetik' -> T2, chunk Energi Kinetik", () => {
  assert.equal(topikPertama("Rumus energi kinetik"), "Energi Kinetik");
  assert.equal(jenisPertanyaan("Rumus energi kinetik", false, true), "T2");
});

test("kasus 3: hitungan Ek -> T3, chunk Energi Kinetik", () => {
  const tanya = "Bola 2 kg melaju 10 m/s, berapa Ek?";
  assert.equal(topikPertama(tanya), "Energi Kinetik");
  assert.equal(jenisPertanyaan(tanya, false, true), "T3");
});

test("kasus 4: resistor paralel -> T3, chunk Rangkaian Paralel", () => {
  const tanya = "Resistor 6 Ω dan 3 Ω paralel, hambatan totalnya?";
  assert.equal(topikPertama(tanya), "Rangkaian Paralel");
  assert.equal(jenisPertanyaan(tanya, false, true), "T3");
});

test("kasus 5: jatuh dari 45 m -> T3, chunk Jatuh Bebas", () => {
  const tanya = "Benda jatuh dari 45 m, berapa waktu jatuhnya?";
  assert.equal(topikPertama(tanya), "Jatuh Bebas");
  assert.equal(jenisPertanyaan(tanya, false, true), "T3");
});

test("kasus 6: sirene Doppler -> T3, chunk Efek Doppler", () => {
  const tanya = "Sirene 700 Hz mendekat 20 m/s, v bunyi 340 m/s";
  assert.equal(topikPertama(tanya), "Efek Doppler");
  assert.equal(jenisPertanyaan(tanya, false, true), "T3");
});

test("kasus 7: di luar materi -> T5 tanpa chunk", () => {
  const chunks = pilihChunk("Jelaskan teori relativitas");
  assert.deepEqual(chunks, []);
  assert.equal(jenisPertanyaan("Jelaskan teori relativitas", false, false), "T5");
});

test("kasus 8: sapaan pendek -> T6 dijawab lokal tanpa API", () => {
  assert.deepEqual(pilihChunk("halo"), []);
  assert.equal(jenisPertanyaan("halo", false, false), "T6");
  const lokal = jawabanLokal("T6");
  assert.ok(lokal.includes("?"));
  assert.ok(lokal.includes("Hukum Newton"));
  assert.equal(jawabanLokal("T1"), null);
});

test("kasus 9: ada gambar -> T4", () => {
  assert.equal(jenisPertanyaan("Soal nomor 3", true, false), "T4");
});

test("pesan lanjutan memakai chunk sebelumnya", () => {
  const awal = pilihChunk("Jelaskan Hukum Newton");
  const lanjut = pilihChunk("kenapa begitu?", awal[0]);
  assert.equal(lanjut[0]?.topik, "Hukum Newton");
  assert.deepEqual(pilihChunk("kenapa begitu?", null), []);
});

test("prompt jauh lebih pendek daripada mengirim seluruh materi", () => {
  let rata = 0;
  for (const chunk of CHUNKS) {
    const prompt = rakitSystemPrompt("T1", pilihChunk(chunk.topik), chunk.topik);
    rata += prompt.length;
    assert.ok(
      prompt.length < TOTAL_KARAKTER_PENUH * 0.45,
      chunk.topik + " prompt " + prompt.length + " karakter",
    );
  }
  rata = Math.round(rata / CHUNKS.length);
  assert.ok(rata < TOTAL_KARAKTER_PENUH * 0.4, "prompt rata-rata " + rata + " karakter");
});

test("chunk tak relevan tidak ikut terkirim", () => {
  const prompt = rakitSystemPrompt("T1", pilihChunk("Jelaskan Hukum Newton"), "Jelaskan Hukum Newton");
  assert.ok(prompt.includes("[Hukum Newton — Bab 1: Kinematika & Dinamika]"));
  assert.ok(!prompt.includes("Rumus: f_p"), "rumus Doppler ikut terkirim");
  assert.ok(!prompt.includes("Rumus: 1/R_tot"), "rumus paralel ikut terkirim");
});

test("prompt tanpa chunk tetap menyebut batas topik", () => {
  const prompt = rakitSystemPrompt("T5", [], "Jelaskan teori relativitas");
  assert.ok(prompt.includes("DAFTAR TOPIK MATERI"));
  assert.ok(prompt.includes("tidak ada topik yang cocok"));
});

test("rapikanJawaban membuang LaTeX tapi menyisakan penanda tebal", () => {
  const hasil = rapikanJawaban("**Rumus:** \\[ Ek = \\frac{1}{2}mv^2 \\]");
  assert.ok(!hasil.includes("\\"), "masih ada backslash: " + hasil);
  assert.ok(!hasil.includes("\\frac"), "\\frac tidak diganti");
  assert.ok(hasil.includes("**Rumus:**"), "penanda tebal hilang");
});

test("formatJawaban meng-escape HTML lalu mengaktifkan **tebal** dan `kode`", () => {
  const hasil = formatJawaban("<b>x</b> **Ek** = `½mv²`");
  assert.ok(hasil.includes("&lt;b&gt;"), "HTML tidak di-escape");
  assert.ok(hasil.includes("<strong>Ek</strong>"));
  assert.ok(hasil.includes("<code>½mv²</code>"));
  assert.equal(formatJawaban("2*3*4"), "2*3*4");
});
