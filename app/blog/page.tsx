import Link from "next/link";
import type { Metadata } from "next";
import BlogList from "@/components/BlogList";
import type { PostItem } from "@/components/PostCard";
import { listPosts } from "@/lib/posts";
import { postLang, readingMinutes } from "@/lib/postMeta";

export const dynamic = "force-dynamic"; // posts come from the admin page, so never prerender
export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on building scalable web platforms: real-time systems, payments, AI features and migrations.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts: PostItem[] = listPosts(true).map((p) => {
    const lang = postLang(p);
    return {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cover: p.cover || undefined,
      coverAlt: p.coverAlt || undefined,
      at: p.publishedAt ?? p.updatedAt,
      lang,
      minutes: readingMinutes(p.body, lang),
    };
  });

  return (
    <div className="after-hero case-wrap">
      <section className="bl">
        <Link href="/" className="case-back">← Home</Link>
        <header className="bl-head">
          <h1>Blog</h1>
          <p>Notes on building scalable web platforms: real-time systems, payments, AI features and migrations.</p>
        </header>
        {posts.length === 0 ? <p className="bl-empty">No posts yet. Check back soon.</p> : <BlogList posts={posts} />}
      </section>
    </div>
  );
}
