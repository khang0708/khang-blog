// Run: node --experimental-strip-types lib/media.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "media-"));
const { sniffImage, saveImage, readImage, MAX_BYTES } = await import("./media.ts");

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const gif = Buffer.from("GIF89a....");
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.from([1, 2, 3, 4]), Buffer.from("WEBPVP8 ")]);
assert.deepEqual([png, jpg, gif, webp].map(sniffImage), ["png", "jpg", "gif", "webp"]);

// SVG and scripts are refused even if they claim to be images; detection ignores names
assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null);
assert.equal(sniffImage(Buffer.from("<?php echo 1; ?>")), null);
assert.equal(sniffImage(Buffer.alloc(0)), null);

const saved = saveImage(png);
assert.ok("name" in saved && /^[a-f0-9]{16}\.png$/.test(saved.name));
assert.equal(readImage(saved.name)?.type, "png");
assert.deepEqual(readImage(saved.name)?.buf, png);

assert.ok("error" in saveImage(Buffer.from("not an image")));
assert.ok("error" in saveImage(Buffer.alloc(0)));
assert.ok("error" in saveImage(Buffer.concat([png, Buffer.alloc(MAX_BYTES)])), "too big");

// only names we generated can be read: no traversal, no other extensions
for (const bad of ["../config.json", "..%2Fconfig.json", "a.png", "0123456789abcdef.svg", "0123456789abcdef.png/../x", "config.json"]) {
  assert.equal(readImage(bad), null, bad);
}
console.log("ok");
