// Fitur Latihan Harian: notifikasi di lobi untuk mengerjakan soal harian.
// PRD: PRD-DAILY-LATIHAN.md
import { MATERI } from "./latihan-data.js";
import { openDaily } from "./latihan.js";

const STORAGE_KEY = "logicodix_daily_latihan_v1";
const DAILY_COUNT = 5;

const DEFAULT_STATE = {
  date: null,
  soalIds: [],
  completed: false,
  streak: 0,
  lastCompletedDate: null,
  dismissedDate: null,
};

let state = { ...DEFAULT_STATE };
let slot = null;
let showCompletedOnce = false;
let dismissedSession = false;

/* ---------------- util tanggal & PRNG deterministik ---------------- */

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dateKey(date);
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function flatSoal() {
  const list = [];
  for (const materi of MATERI) {
    materi.soal.forEach((soal, index) => {
      list.push({ key: materi.id + "-" + index, soal, materiId: materi.id, nama: materi.nama });
    });
  }
  return list;
}

function pickDaily(dayKey) {
  const pool = flatSoal();
  const rand = mulberry32(hashString(dayKey));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DAILY_COUNT);
}

/* ---------------- state ---------------- */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable in restricted contexts.
  }
  try {
    document.dispatchEvent(new CustomEvent("logicodix:daily-updated"));
  } catch {
    // Non-browser context.
  }
}

function load() {
  try {
    state = { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    state = { ...DEFAULT_STATE };
  }
}

function ensureToday() {
  const today = dateKey();
  if (state.date !== today) {
    state.date = today;
    state.completed = false;
    state.soalIds = pickDaily(today).map((entry) => entry.key);
    if (state.lastCompletedDate !== yesterdayKey()) state.streak = 0;
    save();
  }
  if (!Array.isArray(state.soalIds) || state.soalIds.length !== DAILY_COUNT) {
    state.soalIds = pickDaily(today).map((entry) => entry.key);
    save();
  }
}

function markCompleted() {
  const today = dateKey();
  if (state.lastCompletedDate !== today) {
    state.streak = state.lastCompletedDate === yesterdayKey() ? state.streak + 1 : 1;
    state.lastCompletedDate = today;
  }
  state.completed = true;
  showCompletedOnce = true;
  save();
}

/* ---------------- render ---------------- */

function render() {
  if (!slot) return;
  slot.innerHTML = "";
  ensureToday();

  if (state.completed) {
    if (showCompletedOnce) {
      showCompletedOnce = false;
      slot.appendChild(completedCard());
      slot.classList.add("active");
      return;
    }
    slot.classList.remove("active");
    return;
  }
  if (dismissedSession) {
    slot.classList.remove("active");
    return;
  }
  slot.appendChild(promptCard());
  slot.classList.add("active");
}

function completedCard() {
  const card = document.createElement("div");
  card.className = "daily-latihan done";

  const head = document.createElement("div");
  head.className = "daily-head";
  const tag = document.createElement("span");
  tag.className = "daily-tag";
  tag.textContent = "LATIHAN HARIAN";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "daily-dismiss";
  close.setAttribute("aria-label", "Tutup");
  close.textContent = "✕";
  close.addEventListener("click", closePopup);
  head.append(tag, close);
  card.appendChild(head);

  const text = document.createElement("p");
  text.className = "daily-text";
  text.textContent = "✓ Selesai hari ini! Streak: " + state.streak + " hari 🔥";
  card.appendChild(text);

  const hint = document.createElement("p");
  hint.className = "daily-hint";
  hint.textContent = "Latihan baru tersedia besok. Kamu bisa ulangi kapan saja dari menu LATIHAN.";
  card.appendChild(hint);

  const ok = document.createElement("button");
  ok.type = "button";
  ok.className = "mini-btn accent daily-start";
  ok.textContent = "SIAP";
  ok.addEventListener("click", closePopup);
  card.appendChild(ok);
  return card;
}

function closePopup() {
  slot?.classList.remove("active");
  if (slot) slot.innerHTML = "";
}

function dismissToday() {
  dismissedSession = true;
  render();
}

function promptCard() {
  const card = document.createElement("div");
  card.className = "daily-latihan";

  const head = document.createElement("div");
  head.className = "daily-head";
  const tag = document.createElement("span");
  tag.className = "daily-tag";
  tag.textContent = "LATIHAN HARIAN";
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "daily-dismiss";
  dismiss.setAttribute("aria-label", "Tutup");
  dismiss.textContent = "✕";
  dismiss.addEventListener("click", dismissToday);
  head.append(tag, dismiss);
  card.appendChild(head);

  const text = document.createElement("p");
  text.className = "daily-text";
  text.textContent = DAILY_COUNT + " soal fisika menantimu hari ini.";
  card.appendChild(text);

  const streak = document.createElement("p");
  streak.className = "daily-hint";
  streak.textContent = state.streak > 0 ? "Streak: " + state.streak + " hari 🔥" : "Selesaikan untuk memulai streak 🔥";
  card.appendChild(streak);

  const start = document.createElement("button");
  start.type = "button";
  start.className = "mini-btn accent daily-start";
  start.textContent = "MULAI";
  start.addEventListener("click", startDaily);
  card.appendChild(start);

  return card;
}

function startDaily() {
  const byKey = new Map(flatSoal().map((entry) => [entry.key, entry]));
  const questions = state.soalIds
    .map((key) => byKey.get(key))
    .filter(Boolean)
    .map((entry) => entry.soal);
  if (questions.length === 0) return;

  openDaily(questions, () => {
    markCompleted();
    render();
    return "🔥 Latihan harian selesai! Streak: " + state.streak + " hari";
  });
}

/* ---------------- publik ---------------- */

export function refreshDailyLatihan() {
  if (!slot) return;
  render();
}

export function initDailyLatihan() {
  slot = document.getElementById("dailyLatihanSlot");
  if (!slot) return;
  load();
  ensureToday();
  render();
}

/** Salinan state latihan lokal untuk disinkronkan ke akun. */
export function readDailyState() {
  load();
  ensureToday();
  return { ...state };
}

/** Terapkan state dari akun bila lebih maju (streak/tanggal selesai terakhir). */
export function applyRemoteDaily(remote) {
  if (!remote || typeof remote !== "object") return false;
  load();
  const remoteStreak = Number(remote.streak) || 0;
  const localStreak = Number(state.streak) || 0;
  const remoteDate = String(remote.lastCompletedDate ?? "");
  const localDate = String(state.lastCompletedDate ?? "");
  const lebihMaju = remoteStreak > localStreak || (remoteStreak >= localStreak && remoteDate > localDate);
  if (!lebihMaju) return false;
  state = { ...DEFAULT_STATE, ...remote };
  save();
  ensureToday();
  render();
  return true;
}
