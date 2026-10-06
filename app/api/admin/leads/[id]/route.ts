import { guard } from "@/lib/adminAuth";
import { deleteLead, updateLead } from "@/lib/leadStore";
import type { LeadStatus } from "@/lib/leads";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = (await req.json().catch(() => null)) as { status?: LeadStatus } | null;
  return updateLead((await params).id, { status: b?.status }) ? Response.json({ ok: true }) : Response.json({ error: "not_found" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  return deleteLead((await params).id) ? Response.json({ ok: true }) : Response.json({ error: "not_found" }, { status: 404 });
}
