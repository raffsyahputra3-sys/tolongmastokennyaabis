import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { GameClient } from "../client/net.js";
import { AuthError } from "../client/auth.js";

// Konfigurasi uji dipasang SEBELUM modul server/auth.js diimpor (dibaca saat import).
const SECRET = "rahasia-uji-jwt-logicodix";
process.env.SUPABASE_URL = "https://contoh.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon-key-uji";
process.env.SUPABASE_JWT_SECRET = SECRET;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

const auth = await import("../server/auth.js");

function encode(part) {
  return Buffer.from(JSON.stringify(part)).toString("base64url");
}

function signToken(payload, secret = SECRET) {
  const input = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
  const signature = createHmac("sha256", secret).update(input).digest("base64url");
  return `${input}.${signature}`;
}

const basePayload = (extra = {}) => ({
  sub: "11111111-2222-3333-4444-555555555555",
  email: "pemain@contoh.com",
  aud: "authenticated",
  exp: Math.floor(Date.now() / 1000) + 3600,
  ...extra,
});

test("konfigurasi publik Supabase aktif dan tidak memaparkan service role", () => {
  const config = auth.supabaseConfig();
  assert.equal(config.enabled, true);
  assert.equal(config.url, "https://contoh.supabase.co");
  assert.equal(config.anonKey, "anon-key-uji");
  assert.equal(config.accountDeletion, false, "tanpa service role, hapus akun tidak tersedia");
  assert.equal("serviceKey" in config, false);
});

test("token HS256 yang valid diterima dan mengembalikan identitas", async () => {
  const user = await auth.verifyAccessToken(signToken(basePayload()));
  assert.equal(user.id, "11111111-2222-3333-4444-555555555555");
  assert.equal(user.email, "pemain@contoh.com");
});

test("token kedaluwarsa, tanda tangan salah, aud keliru, atau sampah ditolak", async () => {
  assert.equal(await auth.verifyAccessToken(signToken(basePayload({ exp: Math.floor(Date.now() / 1000) - 10 }))), null);
  assert.equal(await auth.verifyAccessToken(signToken(basePayload(), "secret-lain")), null);
  assert.equal(await auth.verifyAccessToken(signToken(basePayload({ aud: "anon" }))), null);
  assert.equal(await auth.verifyAccessToken(signToken(basePayload({ sub: "x" }))), null);
  assert.equal(await auth.verifyAccessToken("bukan.token"), null);
  assert.equal(await auth.verifyAccessToken(""), null);
});

test("ekspor & hapus akun tanpa service role mengembalikan unavailable (tidak menyentuh jaringan)", async () => {
  assert.deepEqual(await auth.deleteAccount("11111111-2222-3333-4444-555555555555"), { error: "unavailable" });
  assert.deepEqual(await auth.exportAccount("11111111-2222-3333-4444-555555555555"), { error: "unavailable" });
});

test("GameClient membubuhkan access token hanya pada pesan sesi", () => {
  const client = Object.create(GameClient.prototype);
  let token = "token-uji";
  client.getAccessToken = () => token;

  assert.deepEqual(client.withToken({ type: "practice" }), { type: "practice", accessToken: "token-uji" });
  assert.deepEqual(client.withToken({ type: "quickMatch" }), { type: "quickMatch", accessToken: "token-uji" });
  assert.deepEqual(client.withToken({ type: "input", mask: 3 }), { type: "input", mask: 3 });
  assert.deepEqual(client.withToken({ type: "ping" }), { type: "ping" });
  assert.deepEqual(
    client.withToken({ type: "practice", accessToken: "sudah-ada" }),
    { type: "practice", accessToken: "sudah-ada" },
  );

  token = null;
  assert.deepEqual(client.withToken({ type: "practice" }), { type: "practice" });
});

test("AuthError memakai pesan umum (tidak membocorkan akun/email)", () => {
  assert.equal(new AuthError("invalid").message, "Email atau kata sandi tidak benar.");
  assert.equal(new AuthError("email-exists").message, "Pendaftaran tidak dapat diproses dengan data ini.");
  assert.equal(new AuthError("tidak-dikenal").message, "Email atau kata sandi tidak benar.");
});
