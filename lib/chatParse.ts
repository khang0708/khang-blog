// The model writes plain text plus small directives like [[project:aihr]] or [[reply:Tell me more]].
// The UI turns directives into cards and buttons built from lib/content.ts, so the facts in a card are never model-written.
export type Part =
  | { type: "text"; text: string }
  | { type: "card"; kind: "project" | "job" | "skills" | "contact" | "stats" | "goto" | "live" | "lead"; arg: string }
  | { type: "reply"; text: string };

const RE = /\[\[(project|job|skills|contact|stats|goto|live|lead|reply)(?::([^\]]*))?\]\]/g;

export function parseChat(raw: string): Part[] {
  // while streaming, a directive may be cut off mid-way: hide it until it closes
  const src = raw.replace(/\[\[[^\]]*$/, "");
  const parts: Part[] = [];
  let last = 0;
  const text = (s: string) => {
    const t = s.trim();
    if (t) parts.push({ type: "text", text: t });
  };

  for (const m of src.matchAll(RE)) {
    text(src.slice(last, m.index));
    last = m.index + m[0].length;
    const kind = m[1];
    const arg = (m[2] ?? "").trim();
    if (kind === "reply") {
      if (arg) parts.push({ type: "reply", text: arg });
    } else {
      parts.push({ type: "card", kind: kind as Extract<Part, { type: "card" }>["kind"], arg });
    }
  }
  text(src.slice(last));
  return parts;
}
