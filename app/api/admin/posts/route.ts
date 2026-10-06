import { guard } from "@/lib/adminAuth";
import { createPost, listPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return (await guard(req)) ?? Response.json({ posts: listPosts() });
}

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const r = createPost((await req.json().catch(() => null)) ?? {});
  return r.ok ? Response.json({ post: r.post }) : Response.json({ error: r.error }, { status: 400 });
}
