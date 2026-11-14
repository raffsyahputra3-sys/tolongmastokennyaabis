// Antarmuka akun: daftar/masuk/keluar, ekspor & hapus data, sinkron progres latihan.
// Prinsip etika: consent eksplisit, data minimal, pesan error tidak membocorkan akun.
// PRD: PRD-LOGIN.md
import { AuthError } from "./auth.js";
import { applyRemoteDaily, readDailyState } from "./daily-latihan.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DELETE_PHRASE = "HAPUS AKUN";

export function initAuthUI({ auth, toast = () => {}, getSkill = () => 2 }) {
  const el = (id) => document.getElementById(id);
  const els = {
    btn: el("authBtn"),
    label: el("authLabel"),
    overlay: el("authOverlay"),
    close: el("closeAuthBtn"),
    title: el("authTitle"),
    disabled: el("authDisabled"),
    guest: el("authGuest"),
    account: el("authAccount"),
    tabLogin: el("authTabLogin"),
    tabSignup: el("authTabSignup"),
    email: el("authEmail"),
    password: el("authPassword"),
    signupFields: el("authSignupFields"),
    name: el("authName"),
    consent: el("authConsent"),
    age: el("authAge"),
    status: el("authStatus"),
    forgot: el("authForgot"),
    submit: el("authSubmit"),
    userEmail: el("authUserEmail"),
    displayName: el("authDisplayName"),
    saveProfile: el("authSaveProfile"),
    exportBtn: el("authExport"),
    del: el("authDelete"),
    delRow: el("authDeleteRow"),
    delBox: el("authDeleteBox"),
    delConfirm: el("authDeleteConfirm"),
    delConfirmBtn: el("authDeleteConfirmBtn"),
    logout: el("authLogout"),
  };
  if (!els.overlay) return null;

  let mode = "login";
  let busy = false;

  function setStatus(text, tone = "") {
    if (!els.status) return;
    els.status.textContent = text ?? "";
    els.status.dataset.tone = tone;
  }

  function setBusy(value) {
    busy = value;
    for (const button of [els.submit, els.forgot, els.delConfirmBtn, els.exportBtn, els.logout, els.saveProfile]) {
      if (button) button.disabled = value;
    }
  }

  function render() {
    const signedIn = auth.isSignedIn();
    if (els.label) els.label.textContent = signedIn ? auth.displayName || "AKUN" : "MASUK";
    if (els.title) els.title.textContent = !auth.enabled
      ? "AKUN"
      : signedIn
        ? "AKUN SAYA"
        : mode === "signup"
          ? "DAFTAR AKUN"
          : "MASUK";
    els.disabled?.classList.toggle("hidden", auth.enabled);
    els.guest?.classList.toggle("hidden", !auth.enabled || signedIn);
    els.account?.classList.toggle("hidden", !signedIn);
    els.signupFields?.classList.toggle("hidden", auth.enabled && mode !== "signup");
    els.delRow?.classList.toggle("hidden", !auth.accountDeletion);
    if (!auth.accountDeletion) els.delBox?.classList.add("hidden");
    els.tabLogin?.classList.toggle("active", mode === "login");
    els.tabSignup?.classList.toggle("active", mode === "signup");
    if (els.submit) els.submit.textContent = !auth.enabled ? "BELUM TERSEDIA" : mode === "signup" ? "DAFTAR" : "MASUK";
    if (els.userEmail) els.userEmail.textContent = auth.email ?? "-";
    if (els.displayName && document.activeElement !== els.displayName) {
      els.displayName.value = auth.displayName ?? "";
    }
  }

  function open() {
    render();
    els.overlay.classList.remove("hidden");
    if (auth.enabled && !auth.isSignedIn()) els.email?.focus();
  }

  function close() {
    els.overlay.classList.add("hidden");
    setStatus("");
  }

  function setMode(next) {
    mode = next;
    setStatus("");
    render();
  }

  async function afterSignIn() {
    toast("Berhasil masuk.", "good");
    setStatus("");
    await pullProfile();
    await syncDaily();
    render();
  }

  async function pullProfile() {
    try {
      const profile = await auth.loadProfile();
      const name = profile?.display_name || auth.displayName;
      if (name) {
        if (els.displayName) els.displayName.value = name;
        const nameInput = document.getElementById("nameInput");
        if (nameInput && !nameInput.value.trim()) nameInput.value = name.slice(0, 14);
      }
    } catch {
      // Profil opsional; kegagalan tidak menghalangi bermain.
    }
  }

  async function syncDaily() {
    if (!auth.isSignedIn() || !auth.enabled) return;
    try {
      const remote = await auth.loadDailyProgress();
      const changed = applyRemoteDaily(remote);
      if (changed) toast("Progres latihan dimuat dari akun.", "good");
      await auth.saveDailyProgress(readDailyState());
    } catch {
      // Sinkronisasi bersifat opsional.
    }
  }

  async function pushDaily() {
    if (!auth.isSignedIn() || !auth.enabled) return;
    try {
      await auth.saveDailyProgress(readDailyState());
    } catch {
      // Diamkan bila offline.
    }
  }

  async function submit() {
    if (busy || !auth.enabled) return;
    const email = els.email?.value.trim() ?? "";
    const password = els.password?.value ?? "";
    if (!EMAIL_RE.test(email)) return setStatus("Masukkan email yang valid.");
    if (password.length < 8) return setStatus("Kata sandi minimal 8 karakter.");
    if (mode === "signup") {
      const name = els.name?.value.trim() ?? "";
      if (name.length < 2) return setStatus("Nama tampilan minimal 2 karakter.");
      if (!els.consent?.checked) return setStatus("Setujui Kebijakan Privasi untuk mendaftar.");
      if (!els.age?.checked) return setStatus("Konfirmasi batas usia untuk mendaftar.");
    }
    setBusy(true);
    setStatus("Memproses...");
    try {
      if (mode === "signup") await auth.signUp(email, password, els.name?.value.trim() ?? "");
      else await auth.signIn(email, password);
      els.password.value = "";
      await afterSignIn();
    } catch (error) {
      setStatus(error instanceof AuthError ? error.message : "Terjadi kesalahan. Coba lagi.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (busy || !auth.enabled) return;
    const email = els.email?.value.trim() ?? "";
    if (!EMAIL_RE.test(email)) return setStatus("Isi email dulu untuk memulihkan sandi.");
    setBusy(true);
    try {
      await auth.resetPassword(email);
      setStatus("Bila email terdaftar, tautan pemulihan telah dikirim.", "good");
    } catch (error) {
      setStatus(error instanceof AuthError ? error.message : "Terjadi kesalahan. Coba lagi.", "bad");
    } finally {
      setBusy(false);
    }
  }

  function saveProfile() {
    const name = els.displayName?.value.trim() ?? "";
    if (name.length < 2) return setStatus("Nama tampilan minimal 2 karakter.");
    auth
      .saveProfile({ displayName: name, skillLevel: Number(getSkill()) || 2 })
      .then(() => {
        toast("Nama tersimpan.", "good");
        render();
      })
      .catch(() => setStatus("Gagal menyimpan nama.", "bad"));
  }

  async function exportData() {
    if (busy || !auth.isSignedIn()) return;
    setBusy(true);
    setStatus("Menyiapkan file...");
    try {
      const data = await auth.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logicodix-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Data diunduh.", "good");
    } catch (error) {
      setStatus(error instanceof AuthError ? error.message : "Gagal mengekspor data.", "bad");
    } finally {
      setBusy(false);
    }
  }

  function toggleDelete() {
    els.delBox?.classList.toggle("hidden");
    if (els.delBox && !els.delBox.classList.contains("hidden")) els.delConfirm?.focus();
  }

  async function confirmDelete() {
    if (busy || !auth.isSignedIn()) return;
    if ((els.delConfirm?.value ?? "").trim().toUpperCase() !== DELETE_PHRASE) {
      return setStatus(`Ketik "${DELETE_PHRASE}" untuk mengonfirmasi.`);
    }
    setBusy(true);
    setStatus("Menghapus akun...");
    try {
      await auth.deleteAccount();
      els.delBox?.classList.add("hidden");
      if (els.delConfirm) els.delConfirm.value = "";
      mode = "login";
      setStatus("Akun dihapus. Kamu tetap bisa bermain sebagai tamu.", "good");
      toast("Akun dihapus.", "");
      render();
    } catch (error) {
      setStatus(error instanceof AuthError ? error.message : "Gagal menghapus akun.", "bad");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (busy) return;
    await auth.signOut();
    mode = "login";
    toast("Kamu keluar dari akun.", "");
    setStatus("");
    render();
    close();
  }

  els.btn?.addEventListener("click", open);
  els.close?.addEventListener("click", close);
  els.overlay.addEventListener("click", (event) => {
    if (event.target === els.overlay) close();
  });
  els.tabLogin?.addEventListener("click", () => setMode("login"));
  els.tabSignup?.addEventListener("click", () => setMode("signup"));
  els.submit?.addEventListener("click", submit);
  els.forgot?.addEventListener("click", forgot);
  els.saveProfile?.addEventListener("click", saveProfile);
  els.exportBtn?.addEventListener("click", exportData);
  els.del?.addEventListener("click", toggleDelete);
  els.delConfirmBtn?.addEventListener("click", confirmDelete);
  els.logout?.addEventListener("click", logout);
  els.password?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });

  document.addEventListener("logicodix:daily-updated", () => {
    if (auth.isSignedIn()) pushDaily();
  });
  auth.onChange = () => render();

  render();
  return { render, open, close, syncDaily, pullProfile };
}
