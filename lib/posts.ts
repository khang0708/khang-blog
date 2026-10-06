import { randomBytes } from "node:crypto";
import { readJson, writeJson } from "./db.ts";
import { isImageUrl } from "./imageUrl.ts";
import { slugify } from "./postMeta.ts";

// Blog foundation: posts live in .data/posts.json, written from the admin page, read by /blog.
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: string; // image address: "/media/..", "/blog/.." or https://
  coverAlt?: string;
  body: string; // plain text; "## " starts a heading, "- " lines make a list, blank line separates paragraphs
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
};

export { postLang, slugify } from "./postMeta.ts";

const FILE = "posts.json";
const all = () => readJson<Post[]>(FILE, []);

export const listPosts = (onlyPublished = false) =>
  all()
    .filter((p) => !onlyPublished || p.status === "published")
    .sort((a, b) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt));

export const getPostBySlug = (slug: string, onlyPublished = true) =>
  all().find((p) => p.slug === slug && (!onlyPublished || p.status === "published"));

type Input = { title?: unknown; slug?: unknown; excerpt?: unknown; body?: unknown; status?: unknown; cover?: unknown; coverAlt?: unknown };

function clean(i: Input, existing?: Post): { ok: true; v: Pick<Post, "title" | "slug" | "excerpt" | "body" | "status" | "cover" | "coverAlt"> } | { ok: false; error: string } {
  const title = typeof i.title === "string" ? i.title.trim().slice(0, 140) : existing?.title ?? "";
  if (title.length < 2) return { ok: false, error: "Tiêu đề quá ngắn." };
  const slug = slugify(typeof i.slug === "string" && i.slug.trim() ? i.slug : existing?.slug ?? title);
  if (!slug) return { ok: false, error: "Slug không hợp lệ." };
  const body = typeof i.body === "string" ? i.body.slice(0, 50_000) : existing?.body ?? "";
  const excerpt = typeof i.excerpt === "string" ? i.excerpt.trim().slice(0, 300) : existing?.excerpt ?? "";
  const status = i.status === "published" ? "published" : i.status === "draft" ? "draft" : existing?.status ?? "draft";
  const cover = typeof i.cover === "string" ? i.cover.trim().slice(0, 300) : existing?.cover ?? "";
  if (cover && !isImageUrl(cover)) return { ok: false, error: "Ảnh bìa phải là đường dẫn bắt đầu bằng / hoặc https://." };
  const coverAlt = typeof i.coverAlt === "string" ? i.coverAlt.trim().slice(0, 150) : existing?.coverAlt ?? "";
  return { ok: true, v: { title, slug, excerpt, body, status, cover, coverAlt } };
}

export function createPost(i: Input): { ok: true; post: Post } | { ok: false; error: string } {
  const c = clean(i);
  if (!c.ok) return c;
  const list = all();
  if (list.some((p) => p.slug === c.v.slug)) return { ok: false, error: "Slug đã tồn tại." };
  const now = Date.now();
  const post: Post = { id: randomBytes(6).toString("hex"), ...c.v, createdAt: now, updatedAt: now, publishedAt: c.v.status === "published" ? now : undefined };
  writeJson(FILE, [post, ...list]);
  return { ok: true, post };
}

export function updatePost(id: string, i: Input): { ok: true; post: Post } | { ok: false; error: string } {
  const list = all();
  const old = list.find((p) => p.id === id);
  if (!old) return { ok: false, error: "Không tìm thấy bài viết." };
  const c = clean(i, old);
  if (!c.ok) return c;
  if (list.some((p) => p.id !== id && p.slug === c.v.slug)) return { ok: false, error: "Slug đã tồn tại." };
  const now = Date.now();
  const post: Post = {
    ...old, ...c.v, updatedAt: now,
    publishedAt: c.v.status === "published" ? old.publishedAt ?? now : undefined, // first publish time is kept
  };
  writeJson(FILE, list.map((p) => (p.id === id ? post : p)));
  return { ok: true, post };
}

export function deletePost(id: string) {
  const list = all();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  writeJson(FILE, next);
  return true;
}

/** Adds sample posts as DRAFTS, skipping slugs that already exist, so running it twice never duplicates or overwrites. */
export function importPosts(items: { slug: string; title: string; excerpt: string; body: string; cover?: string; coverAlt?: string }[]) {
  const list = all();
  const have = new Set(list.map((p) => p.slug));
  const now = Date.now();
  const added: Post[] = [];
  items.forEach((s, i) => {
    if (have.has(s.slug)) return;
    added.push({ id: randomBytes(6).toString("hex"), ...s, status: "draft", createdAt: now - i, updatedAt: now - i });
  });
  if (added.length) writeJson(FILE, [...added, ...list]);
  return { added: added.length, skipped: items.length - added.length };
}
