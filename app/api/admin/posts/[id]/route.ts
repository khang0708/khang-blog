import { guard } from "@/lib/adminAuth";
import { deletePost, updatePost } from "@/lib/posts";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const r = updatePost((await params).id, (await req.json().catch(() => null)) ?? {});
  return r.ok ? Response.json({ post: r.post }) : Response.json({ error: r.error }, { status: 400 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  return deletePost((await params).id) ? Response.json({ ok: true }) : Response.json({ error: "not_found" }, { status: 404 });
}
