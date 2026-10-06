import { isAdmin } from "@/lib/adminAuth";
import { collect } from "@/lib/analyticsStore";
import { rateLimited } from "@/lib/live";

export const runtime = "nodejs";

// Public beacon from the site. It always answers 204 and says nothing about why a hit was ignored.
export async function POST(req: Request) {
  const done = () => new Response(null, { status: 204 });

  const host = req.headers.get("host") ?? "";
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== host) return done(); // only count hits that come from this site
  if (req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return done(); // respect Do Not Track
  if (Number(req.headers.get("content-length") ?? 0) > 2048) return done();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(`collect:${ip}`, 120)) return done();
  if (await isAdmin()) return done(); // the owner's own visits are not "real traffic"

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || (b.type !== "view" && b.type !== "event")) return done();

  collect({
    type: b.type,
    name: typeof b.name === "string" ? b.name : undefined,
    path: typeof b.path === "string" ? b.path : undefined,
    referrer: typeof b.referrer === "string" ? b.referrer.slice(0, 300) : undefined,
    utm: typeof b.utm === "string" ? b.utm.slice(0, 60) : undefined,
    host,
    ua: req.headers.get("user-agent") ?? "",
    ip,
    country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? undefined,
  });
  return done();
}
