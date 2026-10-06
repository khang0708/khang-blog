import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless admin session: "<expiry>.<hmac>" in an httpOnly cookie. Pure functions so they can be tested without Next.
export const COOKIE = "admin_session";
export const SESSION_TTL = 8 * 3600; // seconds

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD && (process.env.ADMIN_SECRET?.length ?? 0) >= 16;

const sign = (payload: string) => createHmac("sha256", process.env.ADMIN_SECRET ?? "").update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(given: string): boolean {
  if (!adminConfigured()) return false;
  // hash both sides first so lengths match and the compare is constant-time
  const h = (v: string) => createHmac("sha256", "pw").update(v).digest("hex");
  return safeEqual(h(given), h(process.env.ADMIN_PASSWORD!));
}

export function makeSession(nowMs = Date.now()): string {
  const exp = String(Math.floor(nowMs / 1000) + SESSION_TTL);
  return `${exp}.${sign(exp)}`;
}

export function validSession(value: string | undefined, nowMs = Date.now()): boolean {
  if (!value || !adminConfigured()) return false;
  const [exp, sig] = value.split(".");
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > nowMs / 1000;
}
