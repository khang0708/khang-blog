import { randomBytes } from "node:crypto";
import { readJson, writeJson } from "./db.ts";
import { upsertLead, type LeadRec, type LeadStatus } from "./leads.ts";

const FILE = "leads.json";
const all = () => readJson<LeadRec[]>(FILE, []);
const newId = () => randomBytes(6).toString("hex");

export const listLeads = () => all().sort((a, b) => b.last - a.last);

export function saveLead(inc: Parameters<typeof upsertLead>[1]) {
  const r = upsertLead(all(), inc, Date.now(), newId);
  writeJson(FILE, r.list);
  return r;
}

export function updateLead(id: string, patch: { status?: LeadStatus }) {
  const list = all();
  const l = list.find((x) => x.id === id);
  if (!l) return false;
  if (patch.status && ["new", "contacted", "archived"].includes(patch.status)) l.status = patch.status;
  writeJson(FILE, list);
  return true;
}

export function deleteLead(id: string) {
  const list = all();
  const next = list.filter((x) => x.id !== id);
  if (next.length === list.length) return false;
  writeJson(FILE, next);
  return true;
}

const csvCell = (v: string | number) => {
  // a leading = + - @ would run as a formula when opened in Excel/Sheets, so neutralise it
  const s = String(v).replace(/^[=+\-@]/, "'$&").replace(/"/g, '""');
  return `"${s}"`;
};

export function leadsCsv() {
  const head = ["name", "email", "phone", "company", "type", "status", "submissions", "first_seen", "last_seen", "other_contacts", "last_note"];
  const rows = listLeads().map((l) => [
    l.name, l.email, l.phone, l.company, l.role, l.status, l.count,
    new Date(l.first).toISOString(), new Date(l.last).toISOString(), l.alt.join(" | "), l.note.replace(/\s+/g, " "),
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}
