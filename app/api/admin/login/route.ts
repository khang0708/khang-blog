import { cookies } from "next/headers";
import { adminConfigured, checkPassword, COOKIE, makeSession, SESSION_TTL } from "@/lib/adminSession";
import { rateLimited } from "@/lib/live";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`login:${ip}`, 5)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const b = (await req.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof b?.password !== "string" || !checkPassword(b.password)) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return Response.json({ error: "invalid" }, { status: 401 });
  }

  (await cookies()).set(COOKIE, makeSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return Response.json({ ok: true });
}
