import { readJson, writeJson } from "./db.ts";
import { decrypt, encrypt } from "./secrets.ts";

// Settings edited in the admin page. Saved secrets are encrypted; env vars stay as a fallback so existing setups keep working.
export type ModelMode = "auto" | "fast" | "smart";

type Stored = {
  anthropicKey?: string;
  modelMode?: ModelMode;
  dailyTokenLimit?: number;
  telegram?: { botToken?: string; chatId?: string; webhookSecret?: string };
};

export type Config = {
  anthropicKey?: string;
  modelMode: ModelMode;
  dailyTokenLimit: number; // 0 = unlimited
  tg: { token?: string; chat?: string; secret?: string };
};

const FILE = "config.json";
const dec = (v?: string) => (v ? decrypt(v) : undefined);

export function getConfig(): Config {
  const s = readJson<Stored>(FILE, {});
  return {
    anthropicKey: dec(s.anthropicKey) || process.env.ANTHROPIC_API_KEY || undefined,
    modelMode: s.modelMode ?? "auto",
    dailyTokenLimit: s.dailyTokenLimit ?? 0,
    tg: {
      token: dec(s.telegram?.botToken) || process.env.TELEGRAM_BOT_TOKEN || undefined,
      chat: s.telegram?.chatId || process.env.TELEGRAM_CHAT_ID || undefined,
      secret: dec(s.telegram?.webhookSecret) || process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
    },
  };
}

type Secret = { set: boolean; source: "admin" | "env" | null; hint: string };
const hint = (v?: string) => (v ? `…${v.slice(-4)}` : "");

/** What the admin UI may see: never the secret itself, only whether it is set, where from, and its last 4 characters. */
export function maskedConfig() {
  const s = readJson<Stored>(FILE, {});
  const c = getConfig();
  const secret = (stored: string | undefined, value: string | undefined): Secret => ({
    set: !!value,
    source: !value ? null : dec(stored) ? "admin" : "env",
    hint: hint(value),
  });
  return {
    anthropicKey: secret(s.anthropicKey, c.anthropicKey),
    modelMode: c.modelMode,
    dailyTokenLimit: c.dailyTokenLimit,
    telegram: {
      botToken: secret(s.telegram?.botToken, c.tg.token),
      chatId: c.tg.chat ?? "",
      webhookSecret: secret(s.telegram?.webhookSecret, c.tg.secret),
    },
    canEncrypt: (process.env.ADMIN_SECRET?.length ?? 0) >= 16,
  };
}

export type ConfigPatch = {
  anthropicKey?: string | null; // string = set, null = clear, undefined = unchanged
  modelMode?: ModelMode;
  dailyTokenLimit?: number;
  telegram?: { botToken?: string | null; chatId?: string; webhookSecret?: string | null };
};

/** Validates and saves a patch. Returns an error message, or null on success. */
export function saveConfig(p: ConfigPatch): string | null {
  const s = readJson<Stored>(FILE, {});
  const t = (s.telegram ??= {});

  if (p.anthropicKey !== undefined) {
    if (p.anthropicKey === null) delete s.anthropicKey;
    else if (!/^sk-ant-[\w-]{20,}$/.test(p.anthropicKey.trim())) return "AI key không hợp lệ (phải bắt đầu bằng sk-ant-).";
    else s.anthropicKey = encrypt(p.anthropicKey.trim());
  }
  if (p.modelMode !== undefined) {
    if (!["auto", "fast", "smart"].includes(p.modelMode)) return "Chế độ model không hợp lệ.";
    s.modelMode = p.modelMode;
  }
  if (p.dailyTokenLimit !== undefined) {
    if (!Number.isInteger(p.dailyTokenLimit) || p.dailyTokenLimit < 0 || p.dailyTokenLimit > 1e9) return "Giới hạn token/ngày không hợp lệ.";
    s.dailyTokenLimit = p.dailyTokenLimit;
  }
  const tp = p.telegram;
  if (tp) {
    if (tp.botToken !== undefined) {
      if (tp.botToken === null) delete t.botToken;
      else if (!/^\d{5,}:[\w-]{20,}$/.test(tp.botToken.trim())) return "Bot token không hợp lệ (dạng 123456:ABC...).";
      else t.botToken = encrypt(tp.botToken.trim());
    }
    if (tp.chatId !== undefined) {
      const id = tp.chatId.trim();
      if (id && !/^-?\d{2,}$/.test(id)) return "Chat ID phải là số (ví dụ 123456789).";
      if (id) t.chatId = id;
      else delete t.chatId;
    }
    if (tp.webhookSecret !== undefined) {
      if (tp.webhookSecret === null || tp.webhookSecret === "") delete t.webhookSecret;
      else if (!/^[\w-]{8,256}$/.test(tp.webhookSecret.trim())) return "Webhook secret chỉ gồm chữ, số, _ - và dài 8 ký tự trở lên.";
      else t.webhookSecret = encrypt(tp.webhookSecret.trim());
    }
  }
  writeJson(FILE, s);
  return null;
}
