// Fitur Latihan: kuis fisika per materi dengan nilai, remedial, dan skor terbaik.
// Juga menyediakan mode harian (dipakai client/daily-latihan.js).
// PRD: PRD-LATIHAN.md + PRD-DAILY-LATIHAN.md
import { MATERI, PASSING } from "./latihan-data.js";

const STORAGE_KEY = "logicodix_latihan_progress_v1";

let progres = {};
try {
  progres = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
} catch {
  progres = {};
}

let els = null;
// { soal:[], index, benar, title, materiId|null, onDone }
let quizState = null;

function simpan() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progres));
  } catch {
    // Storage may be unavailable in restricted contexts.
  }
}

function statusMateri(id) {
  const entry = progres[id];
  if (!entry) return "baru";
  return entry.skor >= PASSING ? "tuntas" : "remedial";
}

function badgeFor(status) {
  if (status === "tuntas") return '<span class="latihan-badge tuntas">✓ Tuntas</span>';
  if (status === "remedial") return '<span class="latihan-badge remedial">⚠ Remedial</span>';
  return '<span class="latihan-badge baru">Belum dicoba</span>';
}

function kembaliMenu() {
  quizState = null;
  els.heading.textContent = "PILIH MATERI";
  els.body.classList.remove("wide");
  renderMenu();
  els.body.scrollTop = 0;
}

function renderMenu() {
  const body = els.body;
  body.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "latihan-grid";

  for (const materi of MATERI) {
    const entry = progres[materi.id];
    const status = statusMateri(materi.id);
    const skor = entry ? entry.skor : 0;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "latihan-card";
    card.innerHTML =
      '<span class="latihan-icon">' + materi.icon + "</span>" +
      "<strong>" + materi.nama + "</strong>" +
      '<span class="latihan-meta">' + materi.soal.length + " soal · " + badgeFor(status) + "</span>" +
      '<span class="latihan-bar"><i class="' + status + '" style="width:' + skor + '%"></i></span>' +
      '<span class="latihan-score"><em>Nilai terbaik</em><b class="' +
      (skor >= PASSING ? "ok" : "no") + '">' + skor + "</b></span>";
    card.addEventListener("click", () => mulaiQuiz(materi.id));
    grid.appendChild(card);
  }
  body.appendChild(grid);

  const remedial = document.createElement("div");
  remedial.className = "latihan-remedial";
  const perlu = MATERI.filter((m) => statusMateri(m.id) === "remedial");
  const semuaTuntas = MATERI.every((m) => statusMateri(m.id) === "tuntas");

  if (perlu.length === 0 && semuaTuntas) {
    remedial.classList.add("all-clear");
    remedial.innerHTML =
      "<h3>🎉 Semua materi tuntas!</h3><p>Kerja bagus. Kamu bisa ulangi materi mana pun untuk menjaga nilai.</p>";
    body.appendChild(remedial);
  } else if (perlu.length > 0) {
    remedial.innerHTML =
      "<h3>🩹 Menu Remedial</h3><p>Materi dengan nilai di bawah " + PASSING + ". Klik untuk mengulang dan perbaiki nilaimu.</p>";
    const list = document.createElement("div");
    list.className = "latihan-chips";
    for (const materi of perlu) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "latihan-chip";
      chip.textContent = materi.icon + " " + materi.nama + " (" + progres[materi.id].skor + ")";
      chip.addEventListener("click", () => mulaiQuiz(materi.id));
      list.appendChild(chip);
    }
    remedial.appendChild(list);
    body.appendChild(remedial);
  }

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "latihan-reset";
  reset.textContent = "Hapus semua progres";
  reset.addEventListener("click", () => {
    if (window.confirm("Hapus semua progres latihan? Tindakan ini tidak bisa dibatalkan.")) {
      progres = {};
      simpan();
      renderMenu();
    }
  });
  body.appendChild(reset);
}

function mulaiQuiz(materiId) {
  const materi = MATERI.find((m) => m.id === materiId);
  if (!materi) return;
  quizState = {
    soal: materi.soal,
    index: 0,
    benar: 0,
    title: materi.icon + " " + materi.nama,
    materiId: materi.id,
    onDone: null,
  };
  els.heading.textContent = quizState.title;
  els.body.classList.add("wide");
  renderSoal();
  els.body.scrollTop = 0;
}

function renderSoal() {
  const state = quizState;
  const soal = state.soal[state.index];
  const total = state.soal.length;

  const body = els.body;
  body.innerHTML =
    '<div class="latihan-quizhead">' +
      '<button class="mini-btn" type="button" data-back>← Kembali</button>' +
      '<span class="latihan-counter">Soal ' + (state.index + 1) + " / " + total + "</span>" +
    "</div>" +
    '<div class="latihan-qbar"><i style="width:' + (state.index / total) * 100 + '%"></i></div>';

  body.querySelector("[data-back]").addEventListener("click", kembaliMenu);

  const box = document.createElement("div");
  box.className = "latihan-qbox";
  const qnum = document.createElement("div");
  qnum.className = "latihan-qnum";
  qnum.textContent = "SOAL " + (state.index + 1);
  const qtext = document.createElement("div");
  qtext.className = "latihan-qtext";
  qtext.textContent = soal.q;
  box.append(qnum, qtext);

  const feedback = document.createElement("div");
  feedback.className = "latihan-feedback";

  let answered = false;
  soal.o.forEach((opsi, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "latihan-opt";
    button.textContent = String.fromCharCode(65 + i) + ". " + opsi;
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const all = box.querySelectorAll(".latihan-opt");
      all.forEach((opt) => (opt.disabled = true));
      if (i === soal.a) {
        button.classList.add("benar");
        feedback.className = "latihan-feedback ok";
        feedback.textContent = "✅ Benar!";
        state.benar += 1;
      } else {
        button.classList.add("salah");
        all[soal.a].classList.add("benar");
        feedback.className = "latihan-feedback no";
        feedback.textContent = "❌ Salah. Jawaban benar: " + String.fromCharCode(65 + soal.a) + ". " + soal.o[soal.a];
      }

      const next = document.createElement("button");
      next.type = "button";
      next.className = "mini-btn accent latihan-next";
      const last = state.index === total - 1;
      next.textContent = last ? "LIHAT HASIL →" : "SOAL BERIKUTNYA →";
      next.addEventListener("click", () => {
        if (last) {
          finishQuiz();
        } else {
          state.index += 1;
          renderSoal();
        }
      });
      box.appendChild(next);
    });
    box.appendChild(button);
  });

  box.appendChild(feedback);
  body.appendChild(box);
}

function finishQuiz() {
  const state = quizState;
  const total = state.soal.length;
  const skor = Math.round((state.benar / total) * 100);

  let note = "";
  if (state.materiId) {
    const lama = progres[state.materiId];
    const simpanBaru = !lama || skor > lama.skor;
    if (simpanBaru) {
      progres[state.materiId] = {
        skor,
        benar: state.benar,
        total,
        tanggal: new Date().toISOString().slice(0, 10),
      };
      simpan();
    }
    if (!simpanBaru && lama) note = "Nilai terbaikmu tetap " + lama.skor + " (percobaan ini tidak lebih tinggi).";
  } else if (state.onDone) {
    note = state.onDone({ benar: state.benar, total, skor }) || "";
  }

  const lulus = skor >= PASSING;
  const emoji = skor === 100 ? "🏆" : lulus ? "🎉" : "💪";
  const pesan =
    skor === 100
      ? "Sempurna! Semua benar."
      : lulus
        ? "Hebat! Kamu tuntas di materi ini."
        : "Belum tuntas. Ayo remedial dan coba lagi!";

  const body = els.body;
  body.classList.remove("wide");
  body.innerHTML =
    '<div class="latihan-result">' +
      '<div class="latihan-emoji">' + emoji + "</div>" +
      '<span class="latihan-result-label">Nilai kamu</span>' +
      '<div class="latihan-big">' + skor + "</div>" +
      '<p class="latihan-result-msg">' + pesan + "</p>" +
      '<div class="latihan-stats">' +
        "<div><b>" + state.benar + "</b>Benar</div>" +
        "<div><b>" + (total - state.benar) + "</b>Salah</div>" +
        "<div><b>" + total + "</b>Total</div>" +
      "</div>" +
      '<div class="latihan-result-btns">' +
        '<button class="mini-btn" type="button" data-ulang>🔄 Ulangi</button>' +
        '<button class="mini-btn accent" type="button" data-menu>🏠 Menu Utama</button>' +
      "</div>" +
    "</div>";

  if (!lulus) {
    const info = document.createElement("div");
    info.className = "latihan-remedial inline";
    info.innerHTML =
      "<h3>🩹 Perlu Remedial</h3><p>Nilaimu " + skor + ", di bawah " + PASSING + ". Ulangi untuk memperbaiki nilai.</p>";
    body.querySelector(".latihan-result").appendChild(info);
  }
  if (note) {
    const noteEl = document.createElement("div");
    noteEl.className = "latihan-note";
    noteEl.textContent = note;
    body.querySelector(".latihan-result").appendChild(noteEl);
  }

  body.querySelector("[data-ulang]").addEventListener("click", () => {
    state.index = 0;
    state.benar = 0;
    els.heading.textContent = state.title;
    els.body.classList.add("wide");
    renderSoal();
  });
  body.querySelector("[data-menu]").addEventListener("click", kembaliMenu);
  body.scrollTop = 0;
}

function open() {
  if (!els) return;
  kembaliMenu();
  els.overlay.classList.remove("hidden");
}

function close() {
  els?.overlay.classList.add("hidden");
}

// Dipakai daily-latihan.js: buka overlay dan langsung jalan mode harian.
export function openDaily(questions, onDone) {
  if (!els) return;
  quizState = { soal: questions, index: 0, benar: 0, title: "🔥 LATIHAN HARIAN", materiId: null, onDone };
  els.overlay.classList.remove("hidden");
  els.heading.textContent = quizState.title;
  els.body.classList.add("wide");
  renderSoal();
  els.body.scrollTop = 0;
}

export function initLatihan() {
  const overlay = document.getElementById("latihanOverlay");
  const openBtn = document.getElementById("latihanBtn");
  if (!overlay || !openBtn) return;

  overlay.innerHTML =
    '<div class="belajar-shell latihan-shell">' +
      '<div class="belajar-head">' +
        '<div><span class="eyebrow">LATIHAN</span><h2 class="latihan-heading">PILIH MATERI</h2><p class="belajar-sub">Pilih materi, jawab soal, lihat skormu. Nilai tersimpan otomatis.</p></div>' +
        '<button class="belajar-close" type="button" data-close aria-label="Tutup">✕</button>' +
      "</div>" +
      '<div class="latihan-body"></div>' +
    "</div>";

  els = {
    overlay,
    heading: overlay.querySelector(".latihan-heading"),
    body: overlay.querySelector(".latihan-body"),
  };

  openBtn.addEventListener("click", open);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) close();
  });
}