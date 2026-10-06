import { guard } from "@/lib/adminAuth";
import { maskedConfig, saveConfig, type ConfigPatch } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return (await guard(req)) ?? Response.json(maskedConfig());
}

export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const patch = (await req.json().catch(() => null)) as ConfigPatch | null;
  if (!patch || typeof patch !== "object") return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  try {
    const error = saveConfig(patch);
    if (error) return Response.json({ error }, { status: 400 });
  } catch (e) {
    console.error("config save failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "Không lưu được cấu hình (kiểm tra ADMIN_SECRET và quyền ghi thư mục .data)." }, { status: 500 });
  }
  return Response.json(maskedConfig());
}
