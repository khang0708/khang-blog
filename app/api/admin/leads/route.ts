import { guard } from "@/lib/adminAuth";
import { leadsCsv, listLeads } from "@/lib/leadStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  if (new URL(req.url).searchParams.get("format") === "csv") {
    return new Response(`\uFEFF${leadsCsv()}`, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="contacts.csv"' },
    });
  }
  return Response.json({ leads: listLeads() });
}
