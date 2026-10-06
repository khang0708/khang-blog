"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, TrendingUp } from "lucide-react";
import { projectIcons } from "./projectIcons";
import { useLang } from "@/lib/i18n";
import { projects } from "@/lib/content";
import TechIcon from "./TechIcon";


export default function Work() {
  const { t } = useLang();
  return (
    <section className="section" id="work">
      <h2 className="section-title">{t({ en: "Selected work", vi: "Dự án chọn lọc" })}</h2>
      <ul className="work-grid">
        {projects.map((p, i) => {
          const Icon = projectIcons[p.slug] ?? Briefcase;
          return (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} className="work-card">
                <span className="work-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="work-top">
                  <span className="work-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
                  <ArrowUpRight className="work-arrow" size={24} aria-hidden="true" />
                </div>
                <h3 className="work-name">{p.name}</h3>
                <p className="work-line">{t(p.line)}</p>
                <p className="work-metric"><TrendingUp size={14} aria-hidden="true" />{t(p.metric)}</p>
                <ul className="chips">
                  {p.stack.slice(0, 5).map((s) => <li key={s}><TechIcon name={s} />{s}</li>)}
                </ul>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
