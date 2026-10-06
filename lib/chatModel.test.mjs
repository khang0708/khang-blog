// Run: node --experimental-strip-types lib/chatModel.test.mjs
import assert from "node:assert/strict";
import { pickModel, FAST, SMART } from "./chatModel.ts";

assert.equal(pickModel("What has Khang built?", 1), FAST);
assert.equal(pickModel("Khang dùng công nghệ gì?", 1), FAST);
assert.equal(pickModel("Is he open to new work?", 3), FAST);
assert.equal(pickModel("Why did he migrate from Vue 2 to Vue 3?", 1), SMART);
assert.equal(pickModel("So sánh dự án JobTest và AIHR", 1), SMART);
assert.equal(pickModel("What is his stack? And where does he live?", 1), SMART);
assert.equal(pickModel("x".repeat(200), 1), SMART);
assert.equal(pickModel("hi", 9), SMART);
assert.equal(pickModel("Why?", 1, "claude-opus-5-5"), "claude-opus-5-5");
console.log("ok");
