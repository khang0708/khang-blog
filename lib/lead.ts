// Server-side validation for the contact form shown inside the chatbot (recruiters, HR, clients).
export type Lead = { name: string; email: string; phone: string; company: string; role: "hr" | "client" | "other"; note: string };
export type LeadResult = { ok: true; lead: Lead } | { ok: false; field: string };

const oneLine = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function validateLead(b: unknown): LeadResult {
  const x = (b ?? {}) as Record<string, unknown>;

  if (x.website) return { ok: false, field: "bot" }; // honeypot: real visitors never see this field
  if (x.consent !== true) return { ok: false, field: "consent" };

  const name = oneLine(x.name, 80);
  if (name.length < 2) return { ok: false, field: "name" };

  const email = oneLine(x.email, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, field: "email" };

  const phone = oneLine(x.phone, 30).replace(/[\s.\-()]/g, "");
  if (phone && !/^\+?\d{8,15}$/.test(phone)) return { ok: false, field: "phone" };

  const role = x.role === "hr" || x.role === "client" ? x.role : "other";
  const note = typeof x.note === "string" ? x.note.trim().slice(0, 500) : "";

  return { ok: true, lead: { name, email, phone, company: oneLine(x.company, 80), role, note } };
}
