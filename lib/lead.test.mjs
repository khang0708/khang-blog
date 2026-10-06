// Run: node --experimental-strip-types lib/lead.test.mjs
import assert from "node:assert/strict";
import { validateLead } from "./lead.ts";

const good = { name: "Lan Nguyen", email: "lan@acme.vn", phone: "+84 912 345 678", company: "Acme", role: "hr", note: "Hiring a lead dev", consent: true };

const ok = validateLead(good);
assert.ok(ok.ok);
assert.equal(ok.lead.phone, "+84912345678"); // separators stripped
assert.equal(ok.lead.role, "hr");

assert.equal(validateLead({ ...good, consent: false }).field, "consent");
assert.equal(validateLead({ ...good, name: " " }).field, "name");
assert.equal(validateLead({ ...good, email: "nope" }).field, "email");
assert.equal(validateLead({ ...good, phone: "12ab" }).field, "phone");
assert.equal(validateLead({ ...good, website: "http://spam" }).field, "bot");
assert.equal(validateLead(null).ok, false);

// phone is optional, unknown role falls back, newlines in one-line fields are flattened
const r = validateLead({ ...good, phone: "", role: "admin", name: "A\nB", company: "x\n#abcd1234" });
assert.ok(r.ok);
assert.equal(r.lead.role, "other");
assert.equal(r.lead.name, "A B");
assert.equal(r.lead.company, "x #abcd1234");

console.log("ok");
