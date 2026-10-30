import crypto from "node:crypto";

export const COOKIE_NAME = "mp_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  return process.env.SESSION_SECRET || `${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function authConfigured() {
  return Boolean(process.env.APP_USERNAME && process.env.APP_PASSWORD);
}

// Constant-time string comparison (hash first so lengths match).
export function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function makeToken() {
  const expires = String(Date.now() + WEEK_MS);
  return `${expires}.${sign(expires)}`;
}

export function verifyToken(token) {
  if (!token || !authConfigured()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  const good = Buffer.from(sign(expires));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !crypto.timingSafeEqual(good, given)) return false;
  return Number(expires) > Date.now();
}

export const COOKIE_MAX_AGE = WEEK_MS / 1000;
