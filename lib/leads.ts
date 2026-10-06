// Contacts collected by the chatbot form. Pure functions here; lib/leadStore.ts does the file I/O.
export type LeadStatus = "new" | "contacted" | "archived";

export type LeadRec = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  note: string;
  alt: string[]; // other emails / phones this person has used
  status: LeadStatus;
  count: number; // how many times they submitted the form
  first: number;
  last: number;
  history: { at: number; note: string }[];
};

type Incoming = { name: string; email: string; phone: string; company: string; role: string; note: string };

export const normEmail = (e: string) => e.trim().toLowerCase();

/** Vietnamese numbers compare equal across +84 / 84 / 0 prefixes and spacing: "+84 912 345 678" == "0912345678". */
export function normPhone(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("84") && d.length >= 10) d = `0${d.slice(2)}`;
  return d;
}

const sameEmail = (a: string, b: string) => !!a && !!b && normEmail(a) === normEmail(b);
const samePhone = (a: string, b: string) => {
  const x = normPhone(a);
  return x.length >= 8 && x === normPhone(b);
};

/** A contact is a duplicate when the email OR the phone matches the primary or any alternate value. */
export function findDuplicate(list: LeadRec[], email: string, phone: string): LeadRec | undefined {
  return list.find(
    (l) =>
      sameEmail(l.email, email) ||
      samePhone(l.phone, phone) ||
      l.alt.some((a) => sameEmail(a, email) || samePhone(a, phone)),
  );
}

export function upsertLead(
  list: LeadRec[],
  inc: Incoming,
  now: number,
  newId: () => string,
): { list: LeadRec[]; rec: LeadRec; duplicate: boolean } {
  const dup = findDuplicate(list, inc.email, inc.phone);

  if (!dup) {
    const rec: LeadRec = {
      id: newId(), ...inc, alt: [], status: "new", count: 1, first: now, last: now, history: [{ at: now, note: inc.note }],
    };
    return { list: [rec, ...list], rec, duplicate: false };
  }

  const rec: LeadRec = { ...dup, alt: [...dup.alt], history: [...dup.history, { at: now, note: inc.note }] };
  rec.count += 1;
  rec.last = now;
  rec.status = "new"; // they wrote again, so it needs attention again
  rec.company ||= inc.company;
  rec.note = inc.note || rec.note;

  // keep every email/phone they ever used so later submissions keep matching
  const known = (v: string) => sameEmail(rec.email, v) || samePhone(rec.phone, v) || rec.alt.some((a) => sameEmail(a, v) || samePhone(a, v));
  if (inc.phone && !known(inc.phone)) (rec.phone ? rec.alt.push(inc.phone) : (rec.phone = inc.phone));
  if (inc.email && !known(inc.email)) rec.alt.push(inc.email);

  return { list: list.map((l) => (l.id === rec.id ? rec : l)), rec, duplicate: true };
}
