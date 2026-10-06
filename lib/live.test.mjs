// Run: node --experimental-strip-types lib/live.test.mjs
import assert from "node:assert/strict";

process.env.TELEGRAM_BOT_TOKEN = "t";
process.env.TELEGRAM_CHAT_ID = "42";
const { routeUpdate, repliesAfter, isValidId, configured } = await import("./live.ts");

assert.ok(configured());
assert.ok(isValidId("abcd1234") && !isValidId("ab") && !isValidId("ABCD1234") && !isValidId("a/../b"));

const msg = (text, replyText, chat = 42) => ({ update_id: 1, message: { text, chat: { id: chat }, reply_to_message: replyText ? { text: replyText } : undefined } });

// a reply is matched to its visitor by the tag in the replied-to message
assert.equal(routeUpdate(msg("Hi Lan!", "#lan12345 · Lan\nHello\n\n(/)\nReply to this message to answer.")), "lan12345");
assert.deepEqual(repliesAfter("lan12345", 0).map((r) => r.text), ["Hi Lan!"]);
assert.equal(repliesAfter("lan12345", 1).length, 0);

// two visitors do not mix
assert.equal(routeUpdate(msg("Hello Minh", "#minh9999\nQ")), "minh9999");
assert.equal(repliesAfter("lan12345", 0).length, 1);

// chats other than the owner's are ignored
assert.equal(routeUpdate(msg("spam", "#lan12345\nx", 7)), null);

// a plain (non-reply) message with no recent visitor goes nowhere
assert.equal(routeUpdate(msg("hello?")), null);

console.log("ok");
