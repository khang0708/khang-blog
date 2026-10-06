import { configured, isValidId, pullUpdates, rateLimited, repliesAfter, webhookMode } from "@/lib/live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!configured()) return Response.json({ replies: [] });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`poll:${ip}`, 40)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const q = new URL(req.url).searchParams;
  const sid = q.get("sid");
  const after = Number(q.get("after") ?? 0);
  if (!isValidId(sid) || !Number.isFinite(after)) return Response.json({ error: "bad_request" }, { status: 400 });

  if (!webhookMode()) await pullUpdates();
  return Response.json({ replies: repliesAfter(sid, after) });
}
