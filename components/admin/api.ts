// Small fetch wrapper for the admin pages. A 401 means the session expired: reload to show the login form.
export async function api<T = any>(url: string, init?: RequestInit & { body?: string }) {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = (await res.json().catch(() => ({}))) as T;
  if (res.status === 401 && !url.includes("/login")) location.reload();
  return { ok: res.ok, status: res.status, data };
}

export const send = (method: string, body?: unknown) => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

export const fmtTime = (ms?: number) =>
  ms ? new Date(ms).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export const fmtNum = (n: number) => n.toLocaleString("en-US");
