// Run: node --experimental-strip-types lib/leads.test.mjs
import assert from "node:assert/strict";
import { findDuplicate, normPhone, upsertLead } from "./leads.ts";

assert.equal(normPhone("+84 912 345 678"), "0912345678");
assert.equal(normPhone("0912.345.678"), "0912345678");
assert.equal(normPhone("84912345678"), "0912345678");

let n = 0;
const id = () => `id${++n}`;
const lead = (o = {}) => ({ name: "Lan", email: "lan@acme.vn", phone: "0912345678", company: "Acme", role: "hr", note: "first", ...o });

let { list, duplicate } = upsertLead([], lead(), 1000, id);
assert.equal(duplicate, false);
assert.equal(list.length, 1);

// same email, different case -> duplicate
let r = upsertLead(list, lead({ email: "LAN@Acme.VN", phone: "", note: "second" }), 2000, id);
assert.ok(r.duplicate);
assert.equal(r.list.length, 1);
assert.equal(r.rec.count, 2);
assert.equal(r.rec.last, 2000);
assert.equal(r.rec.first, 1000);
assert.equal(r.rec.history.length, 2);

// same phone in +84 form, new email -> duplicate; the new email is remembered
r = upsertLead(r.list, lead({ email: "lan.personal@gmail.com", phone: "+84 912 345 678", note: "third" }), 3000, id);
assert.ok(r.duplicate);
assert.equal(r.list.length, 1);
assert.equal(r.rec.count, 3);
assert.deepEqual(r.rec.alt, ["lan.personal@gmail.com"]);

// and now the alternate email alone matches too
assert.ok(findDuplicate(r.list, "Lan.Personal@gmail.com", "").id);

// a different person is a new contact; empty phone never matches empty phone
r = upsertLead(r.list, lead({ name: "Minh", email: "minh@x.io", phone: "" }), 4000, id);
assert.equal(r.duplicate, false);
assert.equal(r.list.length, 2);
r = upsertLead(r.list, lead({ name: "Hoa", email: "hoa@y.io", phone: "" }), 5000, id);
assert.equal(r.duplicate, false);
assert.equal(r.list.length, 3);

// a returning contact comes back as "new" again
list = r.list.map((l) => ({ ...l, status: "archived" }));
r = upsertLead(list, lead({ note: "again" }), 6000, id);
assert.equal(r.rec.status, "new");

console.log("ok");
