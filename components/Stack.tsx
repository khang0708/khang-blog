"use client";

import { Monitor, Server, Database, CreditCard, Cloud, Sparkles, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { stack } from "@/lib/content";
import TechIcon from "./TechIcon";

const icons: Record<string, LucideIcon> = {
  Frontend: Monitor,
  Backend: Server,
  Data: Database,
  Payments: CreditCard,
  Infrastructure: Cloud,
  AI: Sparkles,
};

export default function Stack() {
  const { t } = useLang();
  return (
    <section className="section" id="stack">
      <h2 className="section-title">{t({ en: "What I build with", vi: "Công nghệ tôi dùng" })}</h2>
      <div className="stack-grid">
        {stack.map((g) => {
          const Icon = icons[g.group.en] ?? Sparkles;
          return (
            <div key={g.group.en} className="stack-card">
              <span className="stack-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
              <h3>{t(g.group)}</h3>
              <ul className="chips">
                {g.items.map((it) => <li key={it}><TechIcon name={it} />{it}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
