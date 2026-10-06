import { guard } from "@/lib/adminAuth";
import { MAX_BYTES, saveImage } from "@/lib/media";

export const runtime = "nodejs";

// Image upload for blog posts. Returns the public address to paste into a post or use as its cover.
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + 64 * 1024) return Response.json({ error: "Ảnh quá lớn (tối đa 5MB)." }, { status: 413 });

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Thiếu file ảnh." }, { status: 400 });

  try {
    const r = saveImage(Buffer.from(await file.arrayBuffer()));
    return "error" in r ? Response.json({ error: r.error }, { status: 400 }) : Response.json({ url: `/media/${r.name}` });
  } catch (e) {
    console.error("upload failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "Không lưu được ảnh (kiểm tra quyền ghi thư mục .data)." }, { status: 500 });
  }
}
