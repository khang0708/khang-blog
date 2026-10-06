import { configured, rateLimited, sendLead } from "@/lib/live";
import { validateLead } from "@/lib/lead";
import { saveLead } from "@/lib/leadStore";
import { collect } from "@/lib/analyticsStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`lead:${ip}`, 6)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const v = validateLead(await req.json().catch(() => null));
  if (!v.ok) {
    // a tripped honeypot looks like success so bots learn nothing
    return v.field === "bot" ? Response.json({ ok: true }) : Response.json({ error: "invalid", field: v.field }, { status: 400 });
  }

  // Stored first (deduplicated by email or phone) so nothing is lost even if Telegram is down or not configured.
  let count = 1;
  try {
    count = saveLead(v.lead).rec.count;
  } catch (e) {
    console.error("lead save failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "storage" }, { status: 500 });
  }

  collect({ type: "event", name: "lead_sent", host: req.headers.get("host") ?? "", ua: req.headers.get("user-agent") ?? "", ip });

  if (configured()) {
    try {
      await sendLead(v.lead, new URL(req.url).searchParams.get("page") ?? "/", count);
    } catch (e) {
      console.error("lead notify failed", e instanceof Error ? e.message : e); // the lead is saved, so this is not a failure for the visitor
    }
  }
  return Response.json({ ok: true });
}
