// Verifikasi identitas Supabase untuk server game.
// Kunci rahasia (service role) hanya ada di server; klien hanya memakai anon key.
// PRD: PRD-LOGIN.md
import { constants, createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from "node:crypto";

const JWKS_TTL = 10 * 60 * 1000;

function readConfig() {
  return {
    url: (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, ""),
    anonKey: (process.env.SUPABASE_ANON_KEY || "").trim(),
    serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
    jwtSecret: (process.env.SUPABASE_JWT_SECRET || "").trim(),
  };
}

const CONFIG = readConfig();

/** Konfigurasi publik untuk klien (anon key memang aman di sisi klien). */
export function supabaseConfig() {
  const enabled = Boolean(CONFIG.url && CONFIG.anonKey);
  return {
    enabled,
    url: enabled ? CONFIG.url : null,
    anonKey: enabled ? CONFIG.anonKey : null,
    accountDeletion: Boolean(enabled && CONFIG.serviceKey),
  };
}

export function authEnabled() {
  return Boolean(CONFIG.url && CONFIG.anonKey);
}

let jwksCache = { keys: null, at: 0, url: null };

function base64UrlToBuffer(value) {
  return Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function decodeSegment(value) {
  try {
    return JSON.parse(base64UrlToBuffer(value).toString("utf8"));
  } catch {
    return null;
  }
}

/** Pisahkan token tanpa memverifikasi tanda tangan. */
function decodeJwt(token) {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return null;
  const header = decodeSegment(parts[0]);
  const payload = decodeSegment(parts[1]);
  if (!header?.alg || !payload) return null;
  return {
    header,
    payload,
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: base64UrlToBuffer(parts[2]),
  };
}

async function fetchJwks() {
  if (!CONFIG.url) return null;
  if (jwksCache.keys && jwksCache.url === CONFIG.url && Date.now() - jwksCache.at < JWKS_TTL) {
    return jwksCache.keys;
  }
  try {
    const response = await fetch(`${CONFIG.url}/auth/v1/.well-known/jwks.json`, {
      headers: CONFIG.anonKey ? { apikey: CONFIG.anonKey } : {},
    });
    if (!response.ok) return null;
    const body = await response.json();
    const keys = Array.isArray(body?.keys) ? body.keys : [];
    jwksCache = { keys, at: Date.now(), url: CONFIG.url };
    return keys;
  } catch {
    return null;
  }
}

function algorithmFor(alg) {
  const hash = { 256: "sha256", 384: "sha384", 512: "sha512" }[String(alg).slice(2)];
  if (!hash) return null;
  if (alg.startsWith("ES")) return { name: hash, dsaEncoding: "ieee-p1363" };
  if (alg.startsWith("PS")) {
    return { name: hash, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 };
  }
  return hash; // RS*
}

/**
 * Verifikasi access token Supabase (RS/PS/ES lewat JWKS, atau HS256 lewat JWT secret).
 * Mengembalikan { id, email } bila valid, atau null. Tidak pernah melempar error.
 */
export async function verifyAccessToken(token) {
  if (!authEnabled()) return null;
  const decoded = decodeJwt(token);
  if (!decoded) return null;
  const { header, payload, signingInput, signature } = decoded;
  if (typeof payload.sub !== "string" || payload.sub.length < 8) return null;
  if (Number.isFinite(payload.exp) && Date.now() / 1000 > payload.exp) return null;
  if (payload.aud && payload.aud !== "authenticated") return null;

  try {
    if (header.alg === "HS256") {
      if (!CONFIG.jwtSecret) return null;
      const expected = createHmac("sha256", CONFIG.jwtSecret).update(signingInput).digest();
      if (expected.length !== signature.length || !timingSafeEqual(expected, signature)) return null;
    } else {
      const algorithm = algorithmFor(header.alg);
      if (!algorithm) return null;
      const keys = await fetchJwks();
      if (!keys || keys.length === 0) return null;
      const jwk = keys.find((key) => !header.kid || key.kid === header.kid) ?? keys[0];
      const publicKey = createPublicKey({ key: jwk, format: "jwk" });
      if (!verifySignature(algorithm, Buffer.from(signingInput), publicKey, signature)) return null;
    }
  } catch {
    return null;
  }
  return { id: payload.sub, email: typeof payload.email === "string" ? payload.email : null };
}

/** Hapus akun permanen lewat Admin API Supabase (butuh service role key). */
export async function deleteAccount(userId) {
  if (!CONFIG.url || !CONFIG.serviceKey) return { error: "unavailable" };
  try {
    const response = await fetch(
      `${CONFIG.url}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          apikey: CONFIG.serviceKey,
          Authorization: `Bearer ${CONFIG.serviceKey}`,
        },
      },
    );
    if (!response.ok) return { error: "delete-failed" };
    return { ok: true };
  } catch {
    return { error: "delete-failed" };
  }
}

async function serviceGet(table, query) {
  const response = await fetch(`${CONFIG.url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: CONFIG.serviceKey,
      Authorization: `Bearer ${CONFIG.serviceKey}`,
    },
  });
  if (!response.ok) return [];
  try {
    const body = await response.json();
    return Array.isArray(body) ? body : [];
  } catch {
    return [];
  }
}

/** Data pribadi pengguna untuk ekspor (hak portabilitas data). */
export async function exportAccount(userId) {
  if (!CONFIG.url || !CONFIG.serviceKey) return { error: "unavailable" };
  const id = encodeURIComponent(userId);
  const [profile, daily] = await Promise.all([
    serviceGet("profiles", `id=eq.${id}&select=*`),
    serviceGet("daily_progress", `user_id=eq.${id}&select=*`),
  ]);
  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      userId,
      profile: profile[0] ?? null,
      dailyProgress: daily[0] ?? null,
    },
  };
}
