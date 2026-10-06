import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, listPosts } from "@/lib/posts";
import { fmtDate, headings, postLang, readingMinutes, readLabel } from "@/lib/postMeta";
import PostBody from "@/components/PostBody";
import PostCard, { type PostItem } from "@/components/PostCard";
import { profile } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPostBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt || undefined,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.excerpt || undefined,
      url: `/blog/${p.slug}`,
      publishedTime: new Date(p.publishedAt ?? p.createdAt).toISOString(),
      modifiedTime: new Date(p.updatedAt).toISOString(),
      authors: [profile.name],
      // social sites do not render SVG, so only raster covers become the share image
      ...(p.cover && /\.(png|jpe?g|webp)$/i.test(p.cover) ? { images: [{ url: p.cover, alt: p.coverAlt || p.title }] } : {}),
    },
  };
}

const copy = {
  vi: { toc: "Trong bài viết", more: "Bài viết khác", ctaTitle: "Cần trao đổi về dự án của bạn?", ctaText: "Mình sẵn sàng tư vấn và cùng xây dựng. Để lại thông tin, mình sẽ liên hệ lại.", cta: "Liên hệ với mình", all: "Tất cả bài viết" },
  en: { toc: "On this page", more: "More posts", ctaTitle: "Want to talk about your project?", ctaText: "Happy to advise and build together. Leave your details and I will get back to you.", cta: "Get in touch", all: "All posts" },
} as const;

export default async function BlogPost({ params }: Props) {
  const p = getPostBySlug((await params).slug);
  if (!p) notFound();

  // The site is tagged lang="en", so mark Vietnamese posts for search engines and screen readers.
  const lang = postLang(p);
  const c = copy[lang];
  const toc = headings(p.body);
  const at = p.publishedAt ?? p.updatedAt;

  const related: PostItem[] = listPosts(true)
    .filter((x) => x.slug !== p.slug)
    .slice(0, 3)
    .map((x) => {
      const l = postLang(x);
      return { slug: x.slug, title: x.title, excerpt: x.excerpt, cover: x.cover || undefined, coverAlt: x.coverAlt || undefined, at: x.publishedAt ?? x.updatedAt, lang: l, minutes: readingMinutes(x.body, l) };
    });

  // Structured data for search engines. "<" is escaped so the post text can never close the script tag.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    inLanguage: lang,
    description: p.excerpt || undefined,
    datePublished: new Date(p.publishedAt ?? p.createdAt).toISOString(),
    dateModified: new Date(p.updatedAt).toISOString(),
    image: p.cover ? (p.cover.startsWith("/") ? `${siteUrl}${p.cover}` : p.cover) : undefined,
    mainEntityOfPage: `${siteUrl}/blog/${p.slug}`,
    author: { "@type": "Person", name: profile.name, url: siteUrl },
  }).replace(/</g, "\\u003c"); // the 6 characters <, never a literal "<"

  const tocList = (
    <ol>
      {toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}
    </ol>
  );

  return (
    <div className="after-hero case-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <article className="post" lang={lang}>
        <Link href="/blog" className="case-back">← {c.all}</Link>

        <header className="post-head">
          <p className="post-meta">{fmtDate(at, lang, true)} · {readLabel(lang, readingMinutes(p.body, lang))}</p>
          <h1 className="post-title">{p.title}</h1>
          {p.excerpt && <p className="post-lede">{p.excerpt}</p>}
        </header>

        {p.cover && (
          <figure className="post-cover">
            <img src={p.cover} alt={p.coverAlt || p.title} width={1200} height={630} fetchPriority="high" decoding="async" />
          </figure>
        )}

        <div className="post-grid">
          <div className="post-main">
            {toc.length > 2 && (
              <details className="post-toc-m">
                <summary>{c.toc}</summary>
                <nav aria-label={c.toc}>{tocList}</nav>
              </details>
            )}
            <div className="blog-body"><PostBody text={p.body} /></div>
          </div>
          {toc.length > 2 && (
            <aside className="post-toc">
              <nav aria-label={c.toc}>
                <strong>{c.toc}</strong>
                {tocList}
              </nav>
            </aside>
          )}
        </div>

        <aside className="post-cta">
          <div>
            <strong>{c.ctaTitle}</strong>
            <p>{c.ctaText}</p>
          </div>
          <Link href="/#contact" className="btn btn-primary">{c.cta}</Link>
        </aside>

        {related.length > 0 && (
          <section className="post-related" aria-labelledby="related-h">
            <h2 id="related-h">{c.more}</h2>
            <ul className="bl-grid">
              {related.map((r) => <li key={r.slug}><PostCard p={r} /></li>)}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
