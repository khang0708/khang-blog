// Run: node --experimental-strip-types lib/analytics.test.mjs
import assert from "node:assert/strict";
import { classifyReferrer, cleanPath, compact, dayKey, isBot, parseUA, record, summarize } from "./analytics.ts";

// ---- bots and user agents
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
for (const bot of ["", "Googlebot/2.1", "Mozilla/5.0 (compatible; bingbot/2.0)", "curl/8.0", "python-requests/2.31", "facebookexternalhit/1.1", "HeadlessChrome/120"]) assert.ok(isBot(bot), `bot: ${bot}`);
assert.ok(!isBot(CHROME) && !isBot(IPHONE));
assert.deepEqual(parseUA(CHROME), { device: "Desktop", browser: "Chrome" });
assert.deepEqual(parseUA(IPHONE), { device: "Mobile", browser: "Safari" });
assert.equal(parseUA(CHROME.replace("Chrome/120.0", "Chrome/120.0 Edg/120")).browser, "Edge");

// ---- paths: no query, no private areas, no junk
assert.equal(cleanPath("/blog/x?utm_source=a#top"), "/blog/x");
assert.equal(cleanPath("/blog/"), "/blog");
assert.equal(cleanPath("/"), "/");
for (const bad of ["//evil.com", "javascript:1", "/admin", "/admin/x", "/api/chat", "/_next/x", "/media/a.png", "/a b", 5, undefined, "no-slash"]) assert.equal(cleanPath(bad), null, String(bad));

// ---- referrers
assert.deepEqual(classifyReferrer("", "site.com"), { source: "Direct", host: "" });
assert.deepEqual(classifyReferrer("https://www.google.com/search?q=x", "site.com"), { source: "Search", host: "google.com" });
assert.deepEqual(classifyReferrer("https://l.facebook.com/l.php", "site.com").source, "Social");
assert.deepEqual(classifyReferrer("https://www.linkedin.com/in/x", "site.com").source, "Social");
assert.deepEqual(classifyReferrer("https://t.co/abc", "site.com").source, "Social");
assert.deepEqual(classifyReferrer("https://news.ycombinator.com/", "site.com"), { source: "Referral", host: "news.ycombinator.com" });
assert.deepEqual(classifyReferrer("https://site.com/blog", "site.com"), { source: "Direct", host: "" }, "own site is not a source");
assert.deepEqual(classifyReferrer("not a url", "site.com"), { source: "Direct", host: "" });

// ---- recording
const t0 = new Date("2026-10-06T05:00:00+07:00").getTime();
const fresh = () => ({ salt: "salt1", days: {}, recent: [] });
const view = (o = {}) => ({ type: "view", path: "/", host: "site.com", ua: CHROME, ip: "1.1.1.1", ...o });

const s = fresh();
assert.ok(record(s, view({ referrer: "https://google.com/" }), t0));
assert.ok(record(s, view({ path: "/blog" }), t0 + 1000)); // same visitor, second page
assert.ok(record(s, view({ ip: "2.2.2.2", ua: IPHONE, country: "vn", utm: "Newsletter!" }), t0 + 2000));
assert.equal(record(s, view({ ua: "Googlebot/2.1" }), t0), false);
assert.equal(record(s, view({ path: "/admin" }), t0), false);
assert.equal(record(s, { type: "event", name: "hack", host: "site.com", ua: CHROME, ip: "1.1.1.1" }, t0), false);
assert.ok(record(s, { type: "event", name: "chat_open", host: "site.com", ua: CHROME, ip: "1.1.1.1" }, t0));

const day = s.days[dayKey(t0)];
assert.equal(day.views, 3);
assert.equal(Object.keys(day.visitors).length, 2, "two people");
assert.deepEqual(day.pages, { "/": 2, "/blog": 1 });
assert.deepEqual(day.entries, { "/": 2 }, "only each visitor's first page counts as landing");
assert.deepEqual(day.sources, { Search: 1, Direct: 1 });
assert.deepEqual(day.devices, { Desktop: 1, Mobile: 1 });
assert.deepEqual(day.countries, { VN: 1 });
assert.deepEqual(day.campaigns, { newsletter: 1 });
assert.deepEqual(day.events, { chat_open: 1 });

// no raw IP or user agent is kept anywhere
const dump = JSON.stringify(s);
assert.ok(!dump.includes("1.1.1.1") && !dump.includes("2.2.2.2") && !dump.includes("Mozilla"));

// ---- the same person gets a different id on another day, and finished days keep only a count
const s2 = fresh();
record(s2, view(), t0);
const nextDay = t0 + 86_400_000;
record(s2, view(), nextDay);
const [d1, d2] = [s2.days[dayKey(t0)], s2.days[dayKey(nextDay)]];
assert.equal(d1.visitors, 1, "yesterday compacted to a count");
assert.ok(typeof d2.visitors === "object");
const ids = (st) => st.recent.map((r) => r.v);
assert.notEqual(ids(s2)[0], ids(s2)[1], "id changes every day");

// ---- summary: realtime window, ranges, ordering
const s3 = fresh();
const now = t0 + 10 * 86_400_000;
record(s3, view({ ip: "9.9.9.1" }), now - 6 * 60_000); // 6 min ago: not online
record(s3, view({ ip: "9.9.9.2", path: "/blog" }), now - 60_000);
record(s3, view({ ip: "9.9.9.3", path: "/blog" }), now - 30_000);
record(s3, view({ ip: "9.9.9.2", path: "/work/aihr" }), now - 10_000);
const sum = summarize(s3, 7, now);
assert.equal(sum.online, 2, "two people in the last 5 minutes");
assert.deepEqual(sum.onlinePages.map((x) => x.name).sort(), ["/blog", "/work/aihr"], "each online visitor counts on their latest page");
assert.equal(sum.rows.length, 7);
assert.equal(sum.today.views, 4);
assert.equal(sum.total.views, 4);
assert.equal(sum.pages[0].name, "/blog");

// compact() leaves today alone
const s4 = fresh();
record(s4, view(), t0);
compact(s4, dayKey(t0));
assert.ok(typeof s4.days[dayKey(t0)].visitors === "object");

console.log("ok");
