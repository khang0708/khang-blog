import {
  siVuedotjs, siReact, siNextdotjs, siTypescript, siPinia, siNodedotjs, siNestjs, siLaravel, siPhp,
  siPostgresql, siMongodb, siRedis, siMysql, siApachecassandra, siDocker, siGitlab, siLinux,
  siClaude, siCursor, siGithubcopilot, siOllama, siGooglegemini, siSocketdotio, siPrisma, siLaravelhorizon,
} from "simple-icons";
import { Globe, Radio, ListOrdered, Wallet, Webhook, Scale, Cloud, Sparkles, type LucideIcon } from "lucide-react";

type Brand = { path: string; hex: string };

// Matched by lowercase name prefix; first hit wins.
const brands: [string, Brand][] = [
  ["vue", siVuedotjs], ["react native", siReact], ["react", siReact], ["next.js", siNextdotjs],
  ["typescript", siTypescript], ["pinia", siPinia], ["node.js", siNodedotjs], ["nestjs", siNestjs],
  ["laravel horizon", siLaravelhorizon], ["laravel", siLaravel], ["postgresql", siPostgresql],
  ["mongodb", siMongodb], ["redis", siRedis], ["mysql", siMysql], ["cassandra", siApachecassandra],
  ["docker", siDocker], ["gitlab", siGitlab], ["linux", siLinux], ["claude", siClaude],
  ["cursor", siCursor], ["github copilot", siGithubcopilot], ["ollama", siOllama],
  ["gemini", siGooglegemini], ["socket.io", siSocketdotio], ["prisma", siPrisma],
];

// simple-icons has no OpenAI/AWS, and nothing for these concepts.
const generic: [string, LucideIcon][] = [
  ["openai", Sparkles], ["aws", Cloud], ["rest", Globe], ["websocket", Radio], ["bullmq", ListOrdered],
  ["momo", Wallet], ["zalopay", Wallet], ["onepay", Wallet], ["ipn", Webhook], ["reconciliation", Scale],
];

// Very dark brand colours vanish on the dark background; show those in the ink colour.
function visible(hex: string) {
  const n = parseInt(hex, 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum < 0.28 ? "#e6f1f2" : `#${hex}`;
}

export default function TechIcon({ name }: { name: string }) {
  const k = name.toLowerCase();
  const b = brands.find(([p]) => k.startsWith(p))?.[1];
  if (b) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill={visible(b.hex)} aria-hidden="true">
        <path d={b.path} />
      </svg>
    );
  }
  const G = generic.find(([p]) => k.startsWith(p))?.[1];
  return G ? <G size={16} strokeWidth={1.75} aria-hidden="true" /> : null;
}
