"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import PostCard, { type PostItem } from "./PostCard";

const PAGE = 9;

// Latest post as a feature card, the rest in a grid; client-side search and "show more".
// Every post is in the first HTML and the ones past the first page are merely hidden, so crawlers still see all the links.
export default function BlogList({ posts }: { posts: PostItem[] }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? posts.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(s)) : posts;
  }, [posts, q]);

  const searching = q.trim().length > 0;
  const featured = !searching && list.length > 1 ? list[0] : undefined;
  const rest = featured ? list.slice(1) : list;

  return (
    <>
      <div className="bl-tools">
        <p className="bl-count" aria-live="polite">
          {searching
            ? t({ en: `${list.length} of ${posts.length} posts`, vi: `${list.length} / ${posts.length} bài viết` })
            : t({ en: `${posts.length} posts`, vi: `${posts.length} bài viết` })}
        </p>
        <label className="bl-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
            placeholder={t({ en: "Search posts…", vi: "Tìm bài viết…" })}
            aria-label={t({ en: "Search posts", vi: "Tìm bài viết" })}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label={t({ en: "Clear search", vi: "Xoá tìm kiếm" })}><X size={14} /></button>
          )}
        </label>
      </div>

      {featured && <PostCard p={featured} featured eager />}

      {list.length === 0 ? (
        <p className="bl-empty">{t({ en: "No posts match your search.", vi: "Không có bài viết nào khớp với tìm kiếm." })}</p>
      ) : (
        <ul className="bl-grid">
          {rest.map((p, i) => (
            // posts past the first page stay in the HTML (crawlable) and are only hidden until "show more"
            <li key={p.slug} hidden={i >= shown}><PostCard p={p} /></li>
          ))}
        </ul>
      )}

      {rest.length > shown && (
        <div className="bl-more-wrap">
          <button type="button" className="btn btn-quiet" onClick={() => setShown((n) => n + PAGE)}>
            {t({ en: `Show more (${rest.length - shown})`, vi: `Xem thêm (${rest.length - shown})` })}
          </button>
        </div>
      )}
    </>
  );
}
