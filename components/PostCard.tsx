import Link from "next/link";
import { fmtDate, readLabel, type PostLang } from "@/lib/postMeta";

export type PostItem = {
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  at: number;
  lang: PostLang;
  minutes: number;
};

// No hooks here, so the same card works in server pages (related posts) and client lists.
export default function PostCard({ p, featured = false, eager = false }: { p: PostItem; featured?: boolean; eager?: boolean }) {
  return (
    <Link href={`/blog/${p.slug}`} className={`bl-card ${featured ? "is-featured" : ""}`} lang={p.lang}>
      {p.cover ? (
        <img
          className="bl-thumb"
          src={p.cover}
          alt={p.coverAlt || p.title}
          width={1200}
          height={630}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <span className="bl-thumb bl-thumb-empty" aria-hidden="true" />
      )}
      <span className="bl-body">
        <span className="bl-meta">
          {featured && <b className="bl-badge">{p.lang === "vi" ? "Mới nhất" : "Latest"}</b>}
          {fmtDate(p.at, p.lang)} · {readLabel(p.lang, p.minutes)}
        </span>
        <strong className="bl-title">{p.title}</strong>
        {p.excerpt && <span className="bl-excerpt">{p.excerpt}</span>}
        <span className="bl-more">{p.lang === "vi" ? "Đọc bài" : "Read post"} →</span>
      </span>
    </Link>
  );
}
