import { cookies } from "next/headers";
import { COOKIE } from "@/lib/adminSession";

export const runtime = "nodejs";

export async function POST() {
  (await cookies()).delete(COOKIE);
  return Response.json({ ok: true });
}
