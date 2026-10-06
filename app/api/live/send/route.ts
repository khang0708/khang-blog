import { configured, isValidId, rateLimited, sendToOwner } from "@/lib/live";
import { collect } from "@/lib/analyticsStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!configured()) return Response.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`send:${ip}`, 10)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const b = (await req.json().catch(() => null)) as { sid?: unknown; name?: unknown; text?: unknown; page?: unknown } | null;
  const text = typeof b?.text === "string" ? b.text.trim() : "";
  if (!isValidId(b?.sid) || !text || text.length > 500) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const name = typeof b?.name === "string" ? b.name.replace(/\s+/g, " ").trim().slice(0, 40) : "";
  const page = typeof b?.page === "string" ? b.page.slice(0, 80) : "/";

  try {
    await sendToOwner(b.sid, name, text, page);
  } catch (e) {
    console.error("live send failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "upstream" }, { status: 502 });
  }
  collect({ type: "event", name: "live_message", host: req.headers.get("host") ?? "", ua: req.headers.get("user-agent") ?? "", ip });
  return Response.json({ ok: true });
}
