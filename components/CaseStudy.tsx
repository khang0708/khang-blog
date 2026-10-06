"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, ArrowUpRight, Briefcase, Sparkles, TrendingUp } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { projects, type Project } from "@/lib/content";
import { projectIcons } from "./projectIcons";
import TechIcon from "./TechIcon";

export default function CaseStudy({ project }: { project: Project }) {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const Icon = projectIcons[project.slug] ?? Briefcase;

  // Header settles in on load; highlight cards rise as they enter.
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".h-char", { yPercent: 120, rotate: 10, opacity: 0, duration: 0.8, stagger: 0.04, ease: "back.out(1.6)" })
        .from(".case-fade", { opacity: 0, y: 18, duration: 0.7, stagger: 0.09 }, "-=0.5");

      const rise = ".case-card, .case-side, .case-pager a";
      gsap.set(rise, { opacity: 0, y: 40 });
      ScrollTrigger.batch(rise, {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, [project.slug]);

  return (
    <article className="case" ref={root}>
      <Link href="/#work" className="case-back case-fade">
        <ArrowLeft size={18} aria-hidden="true" />{t({ en: "All work", vi: "Tất cả dự án" })}
      </Link>

      <header className="case-head">
        <div className="case-meta case-fade">
          <span className="case-icon"><Icon size={30} strokeWidth={1.6} aria-hidden="true" /></span>
          <span className="case-count">{String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
        </div>
        <h1 className="case-title" aria-label={project.name}>
          <span className="h-line" aria-hidden="true">
            {Array.from(project.name).map((c, i) => (
              <span key={i} className="h-char">{c === " " ? " " : c}</span>
            ))}
          </span>
        </h1>
        <p className="case-line case-fade">{t(project.line)}</p>
        <p className="case-metric case-fade"><TrendingUp size={16} aria-hidden="true" />{t(project.metric)}</p>
      </header>

      <div className="case-grid">
        <div>
          <p className="case-desc">{t(project.desc)}</p>
          <h2 className="case-h"><Sparkles size={20} aria-hidden="true" />{t({ en: "What I did", vi: "Tôi đã làm gì" })}</h2>
          <ul className="case-cards">
            {project.highlights.map((h, i) => (
              <li key={i} className="case-card">
                <span className="case-num">{String(i + 1).padStart(2, "0")}</span>
                <p>{t(h)}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="case-side">
          <h2 className="case-side-h">{t({ en: "Stack", vi: "Công nghệ" })}</h2>
          <ul className="chips">
            {project.stack.map((s) => <li key={s}><TechIcon name={s} />{s}</li>)}
          </ul>
          {project.href && project.hrefLabel && (
            <a className="btn btn-primary" href={project.href} target="_blank" rel="noreferrer">
              {t(project.hrefLabel)}<ArrowUpRight size={18} aria-hidden="true" style={{ marginLeft: 6, marginRight: 0 }} />
            </a>
          )}
        </aside>
      </div>

      <nav className="case-pager" aria-label={t({ en: "More projects", vi: "Dự án khác" })}>
        <Link href={`/work/${prev.slug}`} className="case-prev">
          <span><ArrowLeft size={16} aria-hidden="true" />{t({ en: "Previous", vi: "Trước" })}</span>
          <strong>{prev.name}</strong>
        </Link>
        <Link href={`/work/${next.slug}`} className="case-next">
          <span>{t({ en: "Next project", vi: "Dự án tiếp theo" })}<ArrowRight size={16} aria-hidden="true" /></span>
          <strong>{next.name}</strong>
        </Link>
      </nav>
    </article>
  );
}
