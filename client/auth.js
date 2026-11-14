// Klien akun pemain memakai Supabase Auth + PostgREST lewat fetch (tanpa dependensi).
// Prinsip: data minimal, consent eksplisit, hak hapus & ekspor data.
// PRD: PRD-LOGIN.md
import { serverHttpBase } from "./net.js";

const SESSION_KEY = "logicodix.auth";
const CONFIG_CACHE_KEY = "logicodix.supabase.config";
const REFRESH_SKEW = 60; // detik sebelum kedaluwarsa -> segarkan diam-diam

const PESAN_UMUM = {
  invalid: "Email atau kata sandi tidak benar.",
  "email-exists": "Pendaftaran tidak dapat diproses dengan data ini.",
  weak: "Kata sandi minimal 8 karakter.",
  rate: "Terlalu banyak percobaan. Coba lagi sebentar.",
  network: "Tidak dapat menghubungi server akun.",
  offline: "Server akun belum aktif.",
  unauthorized: "Sesi kedaluwarsa. Silakan masuk lagi.",
  "delete-failed": "Gagal menghapus akun. Coba lagi.",
  "confirm-email": "Cek email untuk memverifikasi akun, lalu masuk.",
};

export class AuthError extends Error {
  constructor(code) {
    super(PESAN_UMUM[code] ?? PESAN_UMUM.invalid);
    this.code = code;
  }
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Penyimpanan bisa tidak tersedia; sesi tetap hidup di memori.
  }
}

export class AuthClient {
  constructor({ onChange } = {}) {
    this.onChange = onChange ?? (() => {});
    this.config = null;
    this.session = readJson(SESSION_KEY);
    this.enabled = false;
    this.accountDeletion = false;
  }

  /** Ambil konfigurasi Supabase dari server game (anon key aman untuk publik). */
  async loadConfig() {
    try {
      const response = await fetch(`${serverHttpBase()}/api/config`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("bad-status");
      const body = await response.json();
      const supa = body?.supabase ?? null;
      this.config = supa?.enabled ? { url: supa.url, anonKey: supa.anonKey } : null;
      this.accountDeletion = Boolean(supa?.accountDeletion);
      writeJson(CONFIG_CACHE_KEY, this.config ? { ...this.config, accountDeletion: this.accountDeletion } : null);
    } catch {
      const cached = readJson(CONFIG_CACHE_KEY);
      this.config = cached?.url && cached?.anonKey ? { url: cached.url, anonKey: cached.anonKey } : null;
      this.accountDeletion = Boolean(cached?.accountDeletion);
    }
    this.enabled = Boolean(this.config);
    return this.enabled;
  }

  get userId() {
    return this.session?.user?.id ?? null;
  }

  get email() {
    return this.session?.user?.email ?? null;
  }

  get displayName() {
    return this.session?.displayName ?? this.session?.user?.user_metadata?.display_name ?? null;
  }

  isSignedIn() {
    return Boolean(this.userId);
  }

  /** Token akses yang masih berlaku (sinkron, untuk dibubuhkan ke pesan WebSocket). */
  currentToken() {
    const session = this.session;
    if (!session?.accessToken) return null;
    if (session.expiresAt && session.expiresAt - REFRESH_SKEW <= Date.now() / 1000) return null;
    return session.accessToken;
  }

  async #token() {
    if (!this.config) throw new AuthError("offline");
    if (!this.session?.accessToken) throw new AuthError("unauthorized");
    if (this.session.expiresAt && this.session.expiresAt - REFRESH_SKEW <= Date.now() / 1000) {
      await this.refresh();
    }
    return this.session.accessToken;
  }

  #headers(extra = {}) {
    return { apikey: this.config.anonKey, "Content-Type": "application/json", ...extra };
  }

  async #authFetch(path, options = {}) {
    try {
      return await fetch(`${this.config.url}/auth/v1${path}`, options);
    } catch {
      throw new AuthError("network");
    }
  }

  #saveSession(rawAuth, displayName = undefined) {
    const expiresIn = Number(rawAuth?.expires_in) || 3600;
    this.session = {
      accessToken: rawAuth.access_token,
      refreshToken: rawAuth.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      user: rawAuth.user
        ? { id: rawAuth.user.id, email: rawAuth.user.email, user_metadata: rawAuth.user.user_metadata }
        : this.session?.user,
      displayName: displayName ?? this.session?.displayName ?? null,
    };
    writeJson(SESSION_KEY, this.session);
    this.onChange();
  }

  clearSession() {
    this.session = null;
    writeJson(SESSION_KEY, null);
    this.onChange();
  }

  /** Muat sesi tersimpan dan segarkan bila hampir kedaluwarsa. */
  async restore() {
    if (!this.config || !this.session?.refreshToken) return this.isSignedIn();
    if (this.session.expiresAt && this.session.expiresAt - REFRESH_SKEW > Date.now() / 1000) {
      await this.#syncDisplayName();
      return true;
    }
    try {
      await this.refresh();
    } catch {
      this.clearSession();
    }
    return this.isSignedIn();
  }

  async refresh() {
    if (!this.config || !this.session?.refreshToken) throw new AuthError("unauthorized");
    const response = await this.#authFetch("/token?grant_type=refresh_token", {
      method: "POST",
      headers: this.#headers(),
      body: JSON.stringify({ refresh_token: this.session.refreshToken }),
    });
    if (!response.ok) {
      this.clearSession();
      throw new AuthError("unauthorized");
    }
    this.#saveSession(await response.json());
  }

  async #syncDisplayName() {
    if (!this.config || !this.session?.accessToken) return;
    try {
      const response = await this.#authFetch("/user", {
        headers: this.#headers({ Authorization: `Bearer ${this.session.accessToken}` }),
      });
      if (!response.ok) return;
      const user = await response.json();
      this.session.user = { id: user.id, email: user.email, user_metadata: user.user_metadata };
      this.session.displayName = user?.user_metadata?.display_name ?? this.session.displayName ?? null;
      writeJson(SESSION_KEY, this.session);
    } catch {
      // Biarkan sesi seperti adanya.
    }
  }

  async #errorCode(response) {
    if (response.status === 429) return "rate";
    if (response.status === 401 || response.status === 403) return "invalid";
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const code = String(body?.error_code ?? body?.code ?? body?.error ?? "");
    const message = String(body?.msg ?? body?.message ?? body?.error_description ?? "");
    if (/already|exists|registered/i.test(`${code} ${message}`)) return "email-exists";
    if (/weak|password/i.test(`${code} ${message}`)) return "weak";
    if (/rate|too many/i.test(`${code} ${message}`)) return "rate";
    return "invalid";
  }

  /**
   * Daftar akun baru. `data.display_name` disimpan di metadata pengguna.
   * Bila verifikasi email aktif di Supabase, sesi belum terbit -> butuh konfirmasi email.
   */
  async signUp(email, password, displayName) {
    if (!this.config) throw new AuthError("offline");
    const response = await this.#authFetch("/signup", {
      method: "POST",
      headers: this.#headers(),
      body: JSON.stringify({ email, password, data: { display_name: displayName } }),
    });
    if (!response.ok) throw new AuthError(await this.#errorCode(response));
    const body = await response.json();
    if (!body?.access_token) throw new AuthError("confirm-email");
    this.#saveSession(body, displayName);
    return this.isSignedIn();
  }

  async signIn(email, password) {
    if (!this.config) throw new AuthError("offline");
    const response = await this.#authFetch("/token?grant_type=password", {
      method: "POST",
      headers: this.#headers(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new AuthError(await this.#errorCode(response));
    this.#saveSession(await response.json());
    return this.isSignedIn();
  }

  async signOut() {
    const token = this.session?.accessToken;
    this.clearSession();
    if (token && this.config) {
      try {
        await this.#authFetch("/logout", { method: "POST", headers: this.#headers({ Authorization: `Bearer ${token}` }) });
      } catch {
        // Sesi lokal sudah dihapus; kegagalan jaringan tidak masalah.
      }
    }
  }

  async resetPassword(email) {
    if (!this.config) throw new AuthError("offline");
    const response = await this.#authFetch("/recover", {
      method: "POST",
      headers: this.#headers(),
      body: JSON.stringify({ email }),
    });
    if (!response.ok && response.status !== 422) throw new AuthError(await this.#errorCode(response));
    return true;
  }

  // ---- profil & progres (PostgREST dengan RLS) ----

  async #rest(path, options = {}) {
    const token = await this.#token();
    try {
      const response = await fetch(`${this.config.url}/rest/v1${path}`, {
        ...options,
        headers: this.#headers({ Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }),
      });
      if (!response.ok) throw new AuthError(response.status === 401 ? "unauthorized" : "network");
      if (response.status === 204) return null;
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("network");
    }
  }

  async loadProfile() {
    const rows = await this.#rest(`/profiles?id=eq.${this.userId}&select=display_name,skill_level`);
    return rows?.[0] ?? null;
  }

  async saveProfile({ displayName, skillLevel }) {
    const body = {
      id: this.userId,
      display_name: displayName,
      skill_level: skillLevel,
      updated_at: new Date().toISOString(),
    };
    await this.#rest("/profiles", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body),
    });
    if (displayName) {
      const rows = await this.#rest("/profiles?id=eq.${this.userId}&select=display_name");
      if (rows?.[0]?.display_name) {
        this.session.displayName = rows[0].display_name;
        writeJson(SESSION_KEY, this.session);
      }
    }
  }

  async loadDailyProgress() {
    const rows = await this.#rest(`/daily_progress?user_id=eq.${this.userId}&select=state`);
    return rows?.[0]?.state ?? null;
  }

  async saveDailyProgress(state) {
    await this.#rest("/daily_progress", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: this.userId, state, updated_at: new Date().toISOString() }),
    });
  }

  // ---- hak pengguna: ekspor & hapus ----

  async exportData() {
    const token = await this.#token();
    let response;
    try {
      response = await fetch(`${serverHttpBase()}/api/account/export`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new AuthError("network");
    }
    if (!response.ok) throw new AuthError(response.status === 401 ? "unauthorized" : "network");
    return response.json();
  }

  async deleteAccount() {
    const token = await this.#token();
    let response;
    try {
      response = await fetch(`${serverHttpBase()}/api/account/delete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new AuthError("network");
    }
    if (!response.ok) throw new AuthError(response.status === 401 ? "unauthorized" : "delete-failed");
    this.clearSession();
    return true;
  }
}
