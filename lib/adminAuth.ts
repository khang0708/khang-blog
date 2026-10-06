import { cookies } from "next/headers";
import { COOKIE, validSession } from "./adminSession";

/** For server components and route handlers: does the request carry a valid admin session? */
export async function isAdmin(): Promise<boolean> {
  return validSession((await cookies()).get(COOKIE)?.value);
}

/**
 * Gate for every /api/admin route. Returns a Response to send back when the request must be refused, or null to continue.
 * Besides the session cookie (SameSite=Strict), writes must come from this site's own origin.
 */
export async function guard(req: Request): Promise<Response | null> {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
  }
  return null;
}
