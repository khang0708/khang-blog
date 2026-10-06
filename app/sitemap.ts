import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { listPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic"; // new posts appear without a rebuild

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...listPosts(true).map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...projects.map((p) => ({ url: `${siteUrl}/work/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
