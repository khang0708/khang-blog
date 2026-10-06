import { guard } from "@/lib/adminAuth";
import { blogSamples } from "@/lib/blogSamples";
import { importPosts } from "@/lib/posts";

export const runtime = "nodejs";

// "Nạp bài mẫu": adds the sample posts as drafts so they can be reviewed before publishing.
export async function POST(req: Request) {
  return (await guard(req)) ?? Response.json(importPosts(blogSamples));
}
