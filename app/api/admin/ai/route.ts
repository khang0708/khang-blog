import Anthropic from "@anthropic-ai/sdk";
import { guard } from "@/lib/adminAuth";
import { getConfig } from "@/lib/config";

export const runtime = "nodejs";

// "Test key": one tiny request with the cheapest model.
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const key = getConfig().anthropicKey;
  if (!key) return Response.json({ ok: false, message: "Chưa có AI key." });
  try {
    await new Anthropic({ apiKey: key, maxRetries: 0 }).messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8,
      messages: [{ role: "user", content: "ping" }],
    });
    return Response.json({ ok: true, message: "Key hoạt động bình thường." });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return Response.json({ ok: false, message: "Key không hợp lệ hoặc đã bị thu hồi." });
    if (e instanceof Anthropic.PermissionDeniedError) return Response.json({ ok: false, message: "Key không có quyền dùng model này." });
    if (e instanceof Anthropic.RateLimitError) return Response.json({ ok: false, message: "Key đang bị giới hạn tốc độ, thử lại sau." });
    if (e instanceof Anthropic.APIError) return Response.json({ ok: false, message: `Lỗi từ Anthropic (${e.status}).` });
    return Response.json({ ok: false, message: "Không kết nối được tới Anthropic." });
  }
}
