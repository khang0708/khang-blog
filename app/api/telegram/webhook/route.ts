import { timingSafeEqual } from "node:crypto";
import { routeUpdate, webhookMode } from "@/lib/live";

export const runtime = "nodejs";

// Telegram calls this when the owner replies. Registered with a secret token; anything without it is rejected.
export async function POST(req: Request) {
  if (!webhookMode()) return new Response(null, { status: 404 });

  const given = Buffer.from(req.headers.get("x-telegram-bot-api-secret-token") ?? "");
  const want = Buffer.from(process.env.TELEGRAM_WEBHOOK_SECRET ?? "");
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return new Response(null, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  if (update) routeUpdate(update);
  return Response.json({ ok: true });
}
