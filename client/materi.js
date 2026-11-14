// Fitur Materi: ringkasan fisika interaktif (bab, topik, rumus, contoh, kalkulator, kuis).
// PRD: PRD-MATERI.md
import { BAB } from "./materi-data.js";

const STORAGE_KEY = "logicodix_materi_progress_v1";

let progress = {};
try {
  progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
} catch {
  progress = {};
}

let els = null;
let activeBab = BAB[0]?.id ?? null;

function simpanProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage may be unavailable in restricted contexts.
  }
  updateProgressBar();
}

function totalKuis() {
  return BAB.reduce((sum, b) => sum + b.kuis.length, 0);
}

function totalBenar() {
  let count = 0;
  for (const key in progress) {
    if (progress[key]) count += 1;
  }
  return count;
}

function updateProgressBar() {
  if (!els?.progBar) return;
  const total = totalKuis();
  const pct = total ? (totalBenar() / total) * 100 : 0;
  els.progBar.style.width = pct + "%";
  els.progLabel.textContent = totalBenar() + " / " + total + " kuis benar";
}

function renderNav() {
  const nav = els.nav;
  nav.innerHTML = "";
  for (const bab of BAB) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "materi-tab" + (bab.id === activeBab ? " active" : "");
    let benar = 0;
    bab.kuis.forEach((_, index) => {
      if (progress[bab.id + "-" + index]) benar += 1;
    });
    const label = document.createElement("span");
    label.textContent = bab.judul;
    const count = document.createElement("span");
    count.className = "materi-tab-count";
    count.textContent = benar + "/" + bab.kuis.length;
    button.append(label, count);
    button.addEventListener("click", () => {
      activeBab = bab.id;
      renderNav();
      renderBab(bab);
      els.main.scrollTop = 0;
    });
    nav.appendChild(button);
  }
}

function buildCalc(kalk) {
  const box = document.createElement("div");
  box.className = "materi-calc";

  const heading = document.createElement("h4");
  heading.textContent = "🧮 " + kalk.label;
  box.appendChild(heading);

  const inputs = {};
  for (const field of kalk.fields) {
    const row = document.createElement("div");
    row.className = "materi-calc-row";
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.placeholder = "0";
    inputs[field.id] = input;
    row.append(label, input);
    box.appendChild(row);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "mini-btn accent";
  button.textContent = "HITUNG";
  const hasil = document.createElement("div");
  hasil.className = "materi-hasil";

  button.addEventListener("click", () => {
    const values = {};
    for (const key in inputs) {
      const value = parseFloat(inputs[key].value);
      if (Number.isNaN(value)) {
        hasil.className = "materi-hasil err";
        hasil.textContent = "Isi semua input dengan angka.";
        return;
      }
      values[key] = value;
    }
    try {
      const out = kalk.fn(values);
      const isErr =
        typeof out === "string" &&
        (out.indexOf("tidak") >= 0 ||
          out.indexOf("harus") >= 0 ||
          out.indexOf("invalid") >= 0 ||
          out.indexOf("Terjadi") >= 0 ||
          out.indexOf("Massa") >= 0);
      hasil.className = isErr ? "materi-hasil err" : "materi-hasil";
      hasil.innerHTML = out;
    } catch (error) {
      hasil.className = "materi-hasil err";
      hasil.textContent = "Error: " + error.message;
    }
  });

  box.append(button, hasil);
  return box;
}

function buildSoal(babId, index, kuis) {
  const key = babId + "-" + index;
  const box = document.createElement("div");
  box.className = "materi-soal";
  const question = document.createElement("p");
  question.textContent = index + 1 + ". " + kuis.q;
  box.appendChild(question);

  const feedback = document.createElement("div");
  feedback.className = "materi-feedback";

  let answered = Boolean(progress[key]);

  kuis.o.forEach((opsi, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "materi-opsi";
    button.textContent = String.fromCharCode(65 + i) + ". " + opsi;
    button.addEventListener("click", () => {
      if (answered) return;
      if (i === kuis.a) {
        button.classList.add("benar");
        feedback.className = "materi-feedback ok";
        feedback.textContent = "✅ Benar!";
        progress[key] = true;
        answered = true;
        simpanProgress();
        box.querySelectorAll(".materi-opsi").forEach((opt) => (opt.disabled = true));
      } else {
        button.classList.add("salah");
        feedback.className = "materi-feedback no";
        feedback.textContent = "❌ Salah, coba lagi.";
        window.setTimeout(() => button.classList.remove("salah"), 1200);
      }
    });
    box.appendChild(button);
  });

  if (answered) {
    const opts = box.querySelectorAll(".materi-opsi");
    if (opts[kuis.a]) opts[kuis.a].classList.add("benar");
    feedback.className = "materi-feedback ok";
    feedback.textContent = "✅ Sudah dijawab benar.";
    opts.forEach((opt) => (opt.disabled = true));
  }

  box.appendChild(feedback);
  return box;
}

function renderBab(bab) {
  const main = els.main;
  main.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = bab.judul;
  main.appendChild(title);

  const intro = document.createElement("div");
  intro.className = "materi-intro";
  intro.textContent = bab.intro;
  main.appendChild(intro);

  bab.topik.forEach((topik, index) => {
    const heading = document.createElement("h3");
    heading.textContent = index + 1 + ". " + topik.nama;
    main.appendChild(heading);

    const pengertian = document.createElement("p");
    pengertian.className = "materi-pengertian";
    pengertian.textContent = topik.pengertian;
    main.appendChild(pengertian);

    const rumus = document.createElement("div");
    rumus.className = "materi-rumus";
    rumus.textContent = topik.rumus;
    main.appendChild(rumus);

    const contoh = document.createElement("div");
    contoh.className = "materi-contoh";
    const contohLabel = document.createElement("b");
    contohLabel.textContent = "Contoh: ";
    contoh.append(contohLabel, topik.contoh);
    main.appendChild(contoh);

    if (topik.kalk) main.appendChild(buildCalc(topik.kalk));
  });

  const kuisBox = document.createElement("div");
  kuisBox.className = "materi-kuis";
  const kuisHeading = document.createElement("h4");
  kuisHeading.textContent = "🧠 Kuis " + bab.judul;
  kuisBox.appendChild(kuisHeading);
  bab.kuis.forEach((kuis, index) => kuisBox.appendChild(buildSoal(bab.id, index, kuis)));
  main.appendChild(kuisBox);

  updateProgressBar();
}

function open() {
  if (!els) return;
  const first = BAB.find((b) => b.id === activeBab) || BAB[0];
  renderNav();
  renderBab(first);
  els.overlay.classList.remove("hidden");
  els.main.scrollTop = 0;
}

function close() {
  els?.overlay.classList.add("hidden");
}

export function initMateri() {
  const overlay = document.getElementById("materiOverlay");
  const openBtn = document.getElementById("materiBtn");
  if (!overlay || !openBtn) return;

  overlay.innerHTML =
    '<div class="belajar-shell">' +
      '<aside class="materi-side">' +
        '<div class="belajar-head">' +
          '<div><span class="eyebrow">BELAJAR</span><h2>FISIKA INTERAKTIF</h2><p class="belajar-sub">g = 10 m/s² (kecuali disebut lain)</p></div>' +
          '<button class="belajar-close" type="button" data-close aria-label="Tutup">✕</button>' +
        '</div>' +
        '<nav class="materi-nav"></nav>' +
        '<div class="materi-progress"><div class="materi-bar"><i></i></div><span class="materi-prog-label">0 / 0 kuis benar</span></div>' +
      '</aside>' +
      '<main class="materi-main"></main>' +
    '</div>';

  els = {
    overlay,
    nav: overlay.querySelector(".materi-nav"),
    main: overlay.querySelector(".materi-main"),
    progBar: overlay.querySelector(".materi-bar > i"),
    progLabel: overlay.querySelector(".materi-prog-label"),
  };

  openBtn.addEventListener("click", open);
  overlay.querySelector("[data-close]").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) close();
  });

  updateProgressBar();
}
