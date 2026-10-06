// Live chat bridge: visitor <-> Telegram.
// A visitor message is sent to the owner's Telegram chat tagged with the visitor's session id (#abcd1234).
// The owner replies to that message in Telegram; the reply is matched back to the session by the tag in the replied-to text,
// then picked up by the widget's polling. No mapping table is needed.
//
// ponytail: message inbox lives in process memory (globalThis). Fine for `next dev` / a single `next start` server;
// on serverless or several instances swap `store` for Redis/Upstash/Vercel KV.

import { getConfig } from "./config.ts";

export type Reply = { seq: number; text: string; at: number };
type Session = { replies: Reply[]; seq: number; last: number };
type Store = { sessions: Map<string, Session>; offset: number; lastPull: number; lastSession?: string; hits: Map<string, number[]> };

const g = globalThis as unknown as { __live?: Store };
const store: Store = (g.__live ??= { sessions: new Map(), offset: 0, lastPull: 0, hits: new Map() });

const TTL = 24 * 3600_000;
const MAX_REPLIES = 50;

export const isValidId = (id: unknown): id is string => typeof id === "string" && /^[a-z0-9]{8,16}$/.test(id);

const env = () => {
  const { tg } = getConfig();
  return { token: tg.token, chat: tg.chat, secret: tg.secret };
};

export const configured = () => !!(env().token && env().chat);
/** Webhook mode when a secret is set (public HTTPS site); otherwise the poll endpoint pulls getUpdates (works on localhost). */
export const webhookMode = () => !!env().secret;

export function rateLimited(key: string, max = 10) {
  const now = Date.now();
  const recent = (store.hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  store.hits.set(key, recent);
  if (store.hits.size > 5000) store.hits.clear();
  return recent.length > max;
}

export async function tg<T>(method: string, body: object): Promise<T> {
  const { token } = env();
  const base = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org"; // override only for tests
  const res = await fetch(`${base}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(`telegram ${method}: ${json.description}`);
  return json.result;
}

function session(id: string): Session {
  const now = Date.now();
  for (const [k, s] of store.sessions) if (now - s.last > TTL) store.sessions.delete(k);
  let s = store.sessions.get(id);
  if (!s) store.sessions.set(id, (s = { replies: [], seq: 0, last: now }));
  s.last = now;
  return s;
}

export async function sendToOwner(id: string, name: string, text: string, page: string) {
  store.lastSession = id;
  session(id);
  const who = name ? ` · ${name}` : "";
  await tg("sendMessage", {
    chat_id: env().chat,
    text: `#${id}${who}\n${text}\n\n(${page})\nReply to this message to answer.`,
    disable_web_page_preview: true,
  });
}

export async function sendLead(
  l: { name: string; email: string; phone: string; company: string; role: string; note: string },
  page: string,
  count = 1,
) {
  const lines = [
    count > 1 ? `📇 Returning contact (submission #${count}) from the chatbot` : "📇 New lead from the portfolio chatbot",
    `Name: ${l.name}`,
    `Type: ${l.role === "hr" ? "Recruiter / HR" : l.role === "client" ? "Client" : "Other"}`,
    `Email: ${l.email}`,
    l.phone && `Phone: ${l.phone}`,
    l.company && `Company: ${l.company}`,
    l.note && `Note: ${l.note}`,
    `Page: ${page.slice(0, 80)}`,
  ].filter(Boolean);
  await tg("sendMessage", { chat_id: env().chat, text: lines.join("\n"), disable_web_page_preview: true });
}

export function pushReply(id: string, text: string) {
  const s = session(id);
  s.replies.push({ seq: ++s.seq, text, at: Date.now() });
  if (s.replies.length > MAX_REPLIES) s.replies.shift();
}

export function repliesAfter(id: string, after: number): Reply[] {
  return (store.sessions.get(id)?.replies ?? []).filter((r) => r.seq > after);
}

type Update = { update_id: number; message?: { text?: string; chat: { id: number }; reply_to_message?: { text?: string } } };

/** Route one Telegram update to a visitor session. Only the owner's chat is accepted. Returns the session id or null. */
export function routeUpdate(u: Update): string | null {
  const m = u.message;
  if (!m?.text || String(m.chat.id) !== env().chat) return null;
  const tagged = m.reply_to_message?.text?.match(/^#([a-z0-9]{8,16})\b/)?.[1];
  const id = tagged ?? store.lastSession; // a plain message goes to the most recent visitor
  if (!id) return null;
  pushReply(id, m.text.slice(0, 2000));
  return id;
}

/** Local/dev mode: pull new updates from Telegram. Throttled so many polling visitors cause one request. */
export async function pullUpdates() {
  const now = Date.now();
  if (now - store.lastPull < 1500) return;
  store.lastPull = now;
  try {
    const updates = await tg<Update[]>("getUpdates", { offset: store.offset, timeout: 0, allowed_updates: ["message"] });
    for (const u of updates) {
      store.offset = u.update_id + 1;
      routeUpdate(u);
    }
  } catch (e) {
    // 409 = a webhook is registered for this bot; leave it to the webhook route
    console.error("telegram pull failed", e instanceof Error ? e.message : e);
  }
}
