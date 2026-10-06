import { createHash } from "node:crypto";

// First-party, privacy-friendly traffic stats. No cookies and no stored IP addresses: a visitor is a hash of
// (random salt + day + IP + browser), so the same person cannot be followed from one day to the next, and
// once a day is over its hashes are replaced by a plain count. Bots and the site owner are not counted.
export type Counts = Record<string, number>;
export type Day = {
  views: number;
  visitors: Record<string, 1> | number; // hashes during the day, a plain count after it
  pages: Counts;
  entries: Counts; // landing pages
  sources: Counts; // Direct / Search / Social / Referral
  referrers: Counts; // referring sites
  devices: Counts;
  browsers: Counts;
  countries: Counts;
  campaigns: Counts; // utm_source
  events: Counts;
};
export type Recent = { t: number; v: string; p: string };
export type State = { salt: string; days: Record<string, Day>; recent: Recent[] };

export type Hit = {
  type: "view" | "event";
  name?: string;
  path?: string;
  referrer?: string;
  utm?: string;
  host: string;
  ua: string;
  ip: string;
  country?: string;
};

export const EVENTS = ["chat_open", "contact_ai_open", "email_click", "lead_sent", "live_message"] as const;
const ONLINE_MS = 5 * 60_000;

export const emptyDay = (): Day => ({
  views: 0, visitors: {}, pages: {}, entries: {}, sources: {}, referrers: {}, devices: {}, browsers: {}, countries: {}, campaigns: {}, events: {},
});

/** Calendar day in Vietnam, so "today" matches the owner's clock. */
export const dayKey = (ms: number) =>
  new Date(ms).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // YYYY-MM-DD

export const isBot = (ua: string) =>
  !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless|phantom|python|curl|wget|httpclient|java\/|go-http|monitor|uptime|pingdom|gtmetrix|scrapy|axios|node-fetch/i.test(ua);

export function parseUA(ua: string): { device: string; browser: string } {
  const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Mobile" : "Desktop";
  const browser = /edg\//i.test(ua) ? "Edge" : /opr\/|opera/i.test(ua) ? "Opera" : /firefox|fxios/i.test(ua) ? "Firefox"
    : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Other";
  return { device, browser };
}

/** A page path worth counting, or null. Query strings and hashes are dropped so they never leak into the stats. */
export function cleanPath(p: unknown): string | null {
  if (typeof p !== "string" || !p.startsWith("/") || p.startsWith("//")) return null;
  let path = p.split(/[?#]/)[0].slice(0, 120);
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (!/^\/[\w\-./%]*$/.test(path)) return null;
  if (/^\/(admin|api|_next|media)(\/|$)/.test(path)) return null;
  return path;
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|baidu|yandex|coccoc|ecosia|brave)\./i;
const SOCIAL = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|t|x|zalo|youtube|youtu|tiktok|reddit|pinterest|threads|telegram|t)\.(com|me|in|co|be|app|vn)$/i;

export function classifyReferrer(ref: string | undefined, ownHost: string): { source: string; host: string } {
  if (!ref) return { source: "Direct", host: "" };
  let host = "";
  try { host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase(); } catch { return { source: "Direct", host: "" }; }
  if (!host || host === ownHost.replace(/^www\./, "").split(":")[0].toLowerCase()) return { source: "Direct", host: "" };
  if (SEARCH.test(host)) return { source: "Search", host };
  if (SOCIAL.test(host)) return { source: "Social", host };
  return { source: "Referral", host };
}

export const visitorHash = (salt: string, day: string, ip: string, ua: string) =>
  createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);

const bump = (c: Counts, k: string, n = 1) => { if (k) c[k] = (c[k] ?? 0) + n; };

/** Replaces the visitor hashes of finished days by their count (so no per-person data is kept) and drops days older than a year. */
export function compact(state: State, today: string) {
  for (const [d, day] of Object.entries(state.days)) {
    if (d !== today && typeof day.visitors === "object") day.visitors = Object.keys(day.visitors).length;
  }
  for (const k of Object.keys(state.days).sort().slice(0, -366)) delete state.days[k];
}

/** Adds one hit to the state. Returns false when the hit is ignored (bot or invalid). */
export function record(state: State, hit: Hit, now = Date.now()): boolean {
  if (isBot(hit.ua)) return false;
  const today = dayKey(now);
  compact(state, today);
  const day = (state.days[today] ??= emptyDay());

  if (hit.type === "event") {
    if (!hit.name || !(EVENTS as readonly string[]).includes(hit.name)) return false;
    bump(day.events, hit.name);
    return true;
  }

  const path = cleanPath(hit.path);
  if (!path) return false;
  const v = visitorHash(state.salt, today, hit.ip, hit.ua);
  const seen = day.visitors as Record<string, 1>;
  const first = !seen[v]; // first hit of this visitor today = one visit
  seen[v] = 1;

  day.views += 1;
  bump(day.pages, path);
  if (first) {
    bump(day.entries, path);
    const ref = classifyReferrer(hit.referrer, hit.host);
    bump(day.sources, ref.source);
    bump(day.referrers, ref.host);
    const { device, browser } = parseUA(hit.ua);
    bump(day.devices, device);
    bump(day.browsers, browser);
    bump(day.countries, /^[A-Za-z]{2}$/.test(hit.country ?? "") ? hit.country!.toUpperCase() : "");
    bump(day.campaigns, (hit.utm ?? "").toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40));
  }

  state.recent.push({ t: now, v, p: path });
  const cut = now - 30 * 60_000;
  state.recent = state.recent.filter((r) => r.t >= cut).slice(-500);
  return true;
}

const visitorsOf = (d: Day) => (typeof d.visitors === "number" ? d.visitors : Object.keys(d.visitors).length);
const top = (c: Counts, n = 8) => Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));

export function summarize(state: State, days: number, now = Date.now()) {
  const rows: { date: string; views: number; visitors: number }[] = [];
  const agg = { pages: {} as Counts, entries: {} as Counts, sources: {} as Counts, referrers: {} as Counts, devices: {} as Counts, browsers: {} as Counts, countries: {} as Counts, campaigns: {} as Counts, events: {} as Counts };

  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(now - i * 86_400_000);
    const d = state.days[date];
    rows.push({ date, views: d?.views ?? 0, visitors: d ? visitorsOf(d) : 0 });
    if (d) for (const k of Object.keys(agg) as (keyof typeof agg)[]) for (const [name, n] of Object.entries(d[k])) bump(agg[k], name, n);
  }

  const since = now - ONLINE_MS;
  const live = state.recent.filter((r) => r.t >= since);
  const online = new Set(live.map((r) => r.v)).size;
  const onlinePages: Counts = {};
  const lastPerVisitor = new Map<string, string>();
  for (const r of live) lastPerVisitor.set(r.v, r.p);
  for (const p of lastPerVisitor.values()) bump(onlinePages, p);

  const total = rows.reduce((s, r) => ({ views: s.views + r.views, visitors: s.visitors + r.visitors }), { views: 0, visitors: 0 });
  return {
    rows,
    total,
    today: rows[rows.length - 1],
    online,
    onlinePages: top(onlinePages, 5),
    pages: top(agg.pages, 10),
    entries: top(agg.entries, 6),
    sources: top(agg.sources, 4),
    referrers: top(agg.referrers, 8),
    devices: top(agg.devices, 3),
    browsers: top(agg.browsers, 6),
    countries: top(agg.countries, 8),
    campaigns: top(agg.campaigns, 6),
    events: top(agg.events, 6),
  };
}
