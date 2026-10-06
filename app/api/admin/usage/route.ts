import { guard } from "@/lib/adminAuth";
import { getConfig } from "@/lib/config";
import { usageSummary } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 30));
  return Response.json({ ...usageSummary(days), limit: getConfig().dailyTokenLimit });
}
