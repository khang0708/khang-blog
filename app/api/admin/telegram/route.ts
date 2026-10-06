import { guard } from "@/lib/adminAuth";
import { getConfig } from "@/lib/config";
import { tg } from "@/lib/live";

export const runtime = "nodejs";

type Body = { action?: string; url?: string };

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const { tg: c } = getConfig();
  if (!c.token) return Response.json({ ok: false, message: "Chưa có bot token." });
  const b = ((await req.json().catch(() => null)) ?? {}) as Body;

  try {
    if (b.action === "info") {
      const me = await tg<{ username: string }>("getMe", {});
      const hook = await tg<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo", {});
      return Response.json({ ok: true, username: me.username, webhookUrl: hook.url, pending: hook.pending_update_count, lastError: hook.last_error_message ?? "" });
    }
    if (b.action === "test") {
      const me = await tg<{ username: string }>("getMe", {});
      if (!c.chat) return Response.json({ ok: false, message: `Bot @${me.username} hoạt động, nhưng chưa có Chat ID để gửi tin thử.` });
      await tg("sendMessage", { chat_id: c.chat, text: "✅ Tin nhắn thử từ trang admin portfolio." });
      return Response.json({ ok: true, message: `Đã gửi tin thử qua @${me.username}. Hãy kiểm tra Telegram của bạn.` });
    }
    if (b.action === "setWebhook") {
      if (!c.secret) return Response.json({ ok: false, message: "Hãy đặt Webhook secret trước (lưu cấu hình), rồi mới đăng ký webhook." });
      if (!b.url || !/^https:\/\/[^\s]+$/.test(b.url)) return Response.json({ ok: false, message: "Webhook cần một địa chỉ https công khai." });
      await tg("setWebhook", { url: b.url, secret_token: c.secret, allowed_updates: ["message"] });
      return Response.json({ ok: true, message: "Đã đăng ký webhook." });
    }
    if (b.action === "deleteWebhook") {
      await tg("deleteWebhook", {});
      return Response.json({ ok: true, message: "Đã gỡ webhook (quay về chế độ polling khi chạy local)." });
    }
    return Response.json({ ok: false, message: "Hành động không hợp lệ." }, { status: 400 });
  } catch (e) {
    return Response.json({ ok: false, message: e instanceof Error ? e.message.replace(/^telegram \w+: /, "Telegram: ") : "Lỗi không xác định." });
  }
}
