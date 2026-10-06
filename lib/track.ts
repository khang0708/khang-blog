// Browser side of the traffic stats. Sends tiny beacons to /api/collect; nothing is stored in the browser except an opt-out flag.
const optedOut = () => {
  try {
    return localStorage.getItem("no_track") === "1" || navigator.doNotTrack === "1";
  } catch {
    return false;
  }
};

function send(body: object) {
  if (optedOut()) return;
  const data = JSON.stringify(body);
  try {
    const ok = navigator.sendBeacon?.("/api/collect", new Blob([data], { type: "application/json" }));
    if (!ok) fetch("/api/collect", { method: "POST", body: data, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

let last = { path: "", at: 0 };
let first = true;

export function trackView(path: string) {
  const now = Date.now();
  if (path === last.path && now - last.at < 1500) return; // React strict mode runs effects twice in development
  last = { path, at: now };
  const utm = first ? new URLSearchParams(location.search).get("utm_source") ?? "" : "";
  send({ type: "view", path, referrer: first ? document.referrer : "", utm });
  first = false;
}

export type TrackEvent = "chat_open" | "contact_ai_open" | "email_click";
export const track = (name: TrackEvent) => send({ type: "event", name });

export const setOptOut = (on: boolean) => {
  try {
    if (on) localStorage.setItem("no_track", "1");
    else localStorage.removeItem("no_track");
  } catch {
    /* ignore */
  }
};
export const isOptedOut = () => {
  try {
    return localStorage.getItem("no_track") === "1";
  } catch {
    return false;
  }
};
