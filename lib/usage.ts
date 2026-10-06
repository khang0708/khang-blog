import { readJson, writeJson } from "./db.ts";

// Token accounting for the chatbot, so the admin page can show spend and enforce a daily cap.
type Bucket = { in: number; out: number; n: number };
type Day = Record<string, Bucket>; // model -> totals
const FILE = "usage.json";

// $ per million tokens (input, output)
const PRICE: Record<string, [number, number]> = {
  "claude-haiku-4-5": [1, 5],
  "claude-sonnet-5-5": [2, 10],
  "claude-opus-5-5": [4, 20],
};

export const cost = (model: string, input: number, output: number) => {
  const p = PRICE[model];
  return p ? (input * p[0] + output * p[1]) / 1e6 : 0;
};

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function recordUsage(model: string, input: number, output: number) {
  const data = readJson<Record<string, Day>>(FILE, {});
  const day = (data[dayKey()] ??= {});
  const b = (day[model] ??= { in: 0, out: 0, n: 0 });
  b.in += input;
  b.out += output;
  b.n += 1;
  for (const k of Object.keys(data).sort().slice(0, -90)) delete data[k]; // keep 90 days
  writeJson(FILE, data);
}

export function tokensToday(): number {
  const day = readJson<Record<string, Day>>(FILE, {})[dayKey()] ?? {};
  return Object.values(day).reduce((s, b) => s + b.in + b.out, 0);
}

export function usageSummary(days: number) {
  const data = readJson<Record<string, Day>>(FILE, {});
  const rows: { date: string; in: number; out: number; n: number; cost: number }[] = [];
  const byModel: Record<string, { in: number; out: number; n: number; cost: number }> = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(new Date(Date.now() - i * 86_400_000));
    const r = { date, in: 0, out: 0, n: 0, cost: 0 };
    for (const [model, b] of Object.entries(data[date] ?? {})) {
      const c = cost(model, b.in, b.out);
      r.in += b.in; r.out += b.out; r.n += b.n; r.cost += c;
      const m = (byModel[model] ??= { in: 0, out: 0, n: 0, cost: 0 });
      m.in += b.in; m.out += b.out; m.n += b.n; m.cost += c;
    }
    rows.push(r);
  }
  const total = rows.reduce((s, r) => ({ in: s.in + r.in, out: s.out + r.out, n: s.n + r.n, cost: s.cost + r.cost }), { in: 0, out: 0, n: 0, cost: 0 });
  return { rows, byModel, total, today: tokensToday() };
}
