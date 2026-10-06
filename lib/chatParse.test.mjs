// Run: node --experimental-strip-types lib/chatParse.test.mjs
import assert from "node:assert/strict";
import { parseChat } from "./chatParse.ts";

assert.deepEqual(parseChat("Hello there"), [{ type: "text", text: "Hello there" }]);

assert.deepEqual(parseChat("He built this.\n[[project:aihr]]\nAnything else?\n[[reply:Show stack]][[reply:Contact]]"), [
  { type: "text", text: "He built this." },
  { type: "card", kind: "project", arg: "aihr" },
  { type: "text", text: "Anything else?" },
  { type: "reply", text: "Show stack" },
  { type: "reply", text: "Contact" },
]);

// a directive still streaming in is hidden, not shown as raw text
assert.deepEqual(parseChat("Look: [[proj"), [{ type: "text", text: "Look:" }]);
assert.deepEqual(parseChat("Look: [[project:ai"), [{ type: "text", text: "Look:" }]);

// no-arg directive, unknown directive stays as text
assert.deepEqual(parseChat("[[contact]]"), [{ type: "card", kind: "contact", arg: "" }]);
assert.deepEqual(parseChat("a [[nope:x]] b"), [{ type: "text", text: "a [[nope:x]] b" }]);

assert.deepEqual(parseChat("[[live]]"), [{ type: "card", kind: "live", arg: "" }]);

assert.deepEqual(parseChat("[[lead]]"), [{ type: "card", kind: "lead", arg: "" }]);

console.log("ok");
