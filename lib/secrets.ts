import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// AES-256-GCM for secrets saved by the admin page (API keys, bot token). The key comes from ADMIN_SECRET.
let cached: { secret: string; key: Buffer } | null = null;

function key() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not set");
  if (cached?.secret !== secret) cached = { secret, key: scryptSync(secret, "portfolio-admin-v1", 32) };
  return cached.key;
}

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return ["enc1", iv.toString("base64"), c.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

/** undefined when the value is not ours, was tampered with, or ADMIN_SECRET changed. */
export function decrypt(value: string): string | undefined {
  try {
    const [tag, iv, authTag, data] = value.split(":");
    if (tag !== "enc1") return undefined;
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
    d.setAuthTag(Buffer.from(authTag, "base64"));
    return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
  } catch {
    return undefined;
  }
}
