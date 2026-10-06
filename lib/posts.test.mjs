// Run: node --experimental-strip-types lib/posts.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "posts-"));
const { slugify, createPost, updatePost, listPosts, getPostBySlug, deletePost, importPosts } = await import("./posts.ts");
const { blogSamples } = await import("./blogSamples.ts");

assert.equal(slugify("Cách xây dựng nền tảng chịu tải 35.000 người dùng!"), "cach-xay-dung-nen-tang-chiu-tai-35-000-nguoi-dung");
assert.equal(slugify("Đường đến Đà Nẵng"), "duong-den-da-nang");
assert.equal(slugify("   "), "");

const a = createPost({ title: "Hello World", body: "x" });
assert.ok(a.ok && a.post.slug === "hello-world" && a.post.status === "draft");
assert.equal(createPost({ title: "Hello World" }).ok, false, "duplicate slug");
assert.equal(createPost({ title: "x" }).ok, false, "title too short");

// drafts stay private until published; first publish time is kept on later edits
assert.equal(getPostBySlug("hello-world"), undefined);
assert.equal(listPosts(true).length, 0);
const p1 = updatePost(a.post.id, { status: "published" });
assert.ok(p1.ok && p1.post.publishedAt);
assert.ok(getPostBySlug("hello-world"));
const p2 = updatePost(a.post.id, { body: "edited" });
assert.equal(p2.post.publishedAt, p1.post.publishedAt);
assert.equal(updatePost(a.post.id, { status: "draft" }).post.publishedAt, undefined);

assert.ok(deletePost(a.post.id));
assert.equal(deletePost(a.post.id), false);
// sample posts: SEO limits, unique slugs, and importing is idempotent and draft-only
const slugs = new Set();
for (const p of blogSamples) {
  assert.ok(p.title.length <= 60, `title too long (${p.title.length}): ${p.title}`);
  assert.ok(p.excerpt.length >= 110 && p.excerpt.length <= 160, `meta description ${p.excerpt.length} chars: ${p.slug}`);
  assert.ok(/^[a-z0-9-]+$/.test(p.slug) && !slugs.has(p.slug), `bad or duplicate slug: ${p.slug}`);
  assert.equal(slugify(p.slug), p.slug, "slug must already be in canonical form");
  assert.ok(p.body.includes("## "), `no sub-headings: ${p.slug}`);
  assert.ok(p.body.includes("## Câu hỏi thường gặp"), `no FAQ block: ${p.slug}`);
  assert.ok(p.body.split(/\s+/).length >= 350, `too thin (${p.body.split(/\s+/).length} words): ${p.slug}`);
  slugs.add(p.slug);
}
// every sample has a cover and exactly one inline diagram, with alt text; the files exist in public/blog
for (const p of blogSamples) {
  assert.ok(p.cover && p.coverAlt && p.coverAlt.length <= 150, `cover/alt missing: ${p.slug}`);
  const figs = [...p.body.matchAll(/^!\[([^\]]+)\]\((\/blog\/[\w-]+\.svg)\)$/gm)];
  assert.equal(figs.length, 1, `expected one diagram: ${p.slug}`);
  for (const url of [p.cover, figs[0][2]]) assert.ok(fs.existsSync(path.join("public", url)), `missing file ${url}`);
}

// cover addresses are validated
assert.equal(createPost({ title: "Cover ok", cover: "/media/abc.png" }).ok, true);
assert.equal(createPost({ title: "Cover https", cover: "https://example.com/a.jpg" }).ok, true);
for (const bad of ["javascript:alert(1)", "//evil.com/x.png", "data:image/png;base64,AAAA", "http://example.com/a.png", "/a b.png"]) {
  assert.equal(createPost({ title: "Cover bad " + bad.length, cover: bad }).ok, false, `must reject ${bad}`);
}

const first = importPosts(blogSamples);
assert.equal(first.added, blogSamples.length);
assert.equal(listPosts(true).length, 0, "samples are drafts, never public");
const again = importPosts(blogSamples);
assert.deepEqual([again.added, again.skipped], [0, blogSamples.length]);

console.log("ok");
