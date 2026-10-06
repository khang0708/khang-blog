import { randomBytes } from "node:crypto";
import { readJson, writeJson } from "./db.ts";
import { record, summarize, type Hit, type State } from "./analytics.ts";

// Keeps the stats in memory and writes them to .data/analytics.json a few seconds after the last hit,
// so a burst of visitors costs one disk write instead of one per page view.
// ponytail: same single-process file store as the rest of the admin data; use a database on serverless.
const FILE = "analytics.json";
const g = globalThis as unknown as { __analytics?: { state: State; timer?: ReturnType<typeof setTimeout> } };

function box() {
  if (!g.__analytics) {
    const saved = readJson<Partial<State>>(FILE, {});
    g.__analytics = { state: { salt: saved.salt ?? randomBytes(16).toString("hex"), days: saved.days ?? {}, recent: saved.recent ?? [] } };
  }
  return g.__analytics;
}

function scheduleSave() {
  const b = box();
  if (b.timer) return;
  b.timer = setTimeout(() => {
    b.timer = undefined;
    try { writeJson(FILE, b.state); } catch (e) { console.error("analytics save failed", e instanceof Error ? e.message : e); }
  }, 3000);
  b.timer.unref?.();
}

export function collect(hit: Hit): boolean {
  const ok = record(box().state, hit);
  if (ok) scheduleSave();
  return ok;
}

export const getSummary = (days: number) => summarize(box().state, days);
