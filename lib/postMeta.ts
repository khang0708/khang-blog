// Pure helpers shared by the server pages and client components (no file access here).
export type PostLang = "vi" | "en";

/** "vi" when the text has Vietnamese letters, otherwise "en". Used for lang attributes, date formats and labels. */
export const postLang = (p: { title: string; body: string }): PostLang =>
  /[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(p.title + p.body) ? "vi" : "en";

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingMinutes(body: string, lang: PostLang): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / (lang === "vi" ? 180 : 220)));
}

/** The "## " headings of a post with unique anchor ids; PostBody and the table of contents both use this so links always match. */
export function headings(body: string): { id: string; text: string }[] {
  const seen = new Map<string, number>();
  return body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.startsWith("## "))
    .map((b) => {
      const text = b.slice(3).trim();
      let id = slugify(text) || "muc";
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n) id += `-${n + 1}`;
      return { id, text };
    });
}

// A fixed time zone keeps server and browser rendering identical, so dates never cause hydration mismatches.
export const fmtDate = (ms: number, lang: PostLang, long = false) =>
  new Date(ms).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

export const readLabel = (lang: PostLang, minutes: number) => (lang === "vi" ? `${minutes} phút đọc` : `${minutes} min read`);
