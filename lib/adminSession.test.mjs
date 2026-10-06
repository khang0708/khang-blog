// Run: node --experimental-strip-types lib/adminSession.test.mjs
import assert from "node:assert/strict";

const { adminConfigured, checkPassword, makeSession, validSession } = await import("./adminSession.ts");

// not configured -> nothing validates
delete process.env.ADMIN_PASSWORD;
delete process.env.ADMIN_SECRET;
assert.equal(adminConfigured(), false);
assert.equal(checkPassword("x"), false);

process.env.ADMIN_PASSWORD = "correct horse";
process.env.ADMIN_SECRET = "a-long-random-secret-value-1234";
assert.ok(adminConfigured());
assert.ok(checkPassword("correct horse"));
assert.ok(!checkPassword("correct horsE"));
assert.ok(!checkPassword(""));

const now = 1_700_000_000_000;
const s = makeSession(now);
assert.ok(validSession(s, now + 1000));
assert.ok(!validSession(s, now + 9 * 3600 * 1000), "expired");
assert.ok(!validSession(s.replace(/.$/, (c) => (c === "A" ? "B" : "A")), now + 1000), "tampered signature");
assert.ok(!validSession(`${Number(s.split(".")[0]) + 99999}.${s.split(".")[1]}`, now + 1000), "tampered expiry");
assert.ok(!validSession(undefined, now));

// a session signed with another secret is rejected
process.env.ADMIN_SECRET = "a-different-secret-value-5678";
assert.ok(!validSession(s, now + 1000));

console.log("ok");
