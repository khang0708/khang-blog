"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n";
import { jobs, education } from "@/lib/content";
import { Building2, CalendarDays, CheckCircle2, GraduationCap } from "lucide-react";
import TechIcon from "./TechIcon";

export default function Experience() {
  const { t } = useLang();
  const list = useRef<HTMLOListElement>(null);

  // The timeline rule draws as you scroll through it.
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tl-rule-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: 0.4 },
        },
      );
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" id="experience">
      <h2 className="section-title">{t({ en: "Where I've worked", vi: "Nơi tôi đã làm việc" })}</h2>

      <ol className="timeline" ref={list}>
        <span className="tl-rule" aria-hidden="true"><span className="tl-rule-fill" /></span>
        {jobs.map((job) => (
          <li key={job.id} className="job">
            <span className={`job-dot ${job.current ? "is-current" : ""}`} aria-hidden="true" />
            <div className="job-card">
              <div className="job-top">
                <span className="job-badge" aria-hidden="true"><Building2 size={22} strokeWidth={1.6} /></span>
                <div className="job-head">
                  <h3>{t(job.title)}</h3>
                  <p className="job-meta">
                    <span>{job.company}</span>
                    <span><CalendarDays size={14} aria-hidden="true" /> {t(job.period)}</span>
                    {job.current && <span className="job-now">{t({ en: "Current", vi: "Hiện tại" })}</span>}
                  </p>
                </div>
                <div className="job-metric">
                  <strong>{job.metric.value}</strong>
                  <span>{t(job.metric.label)}</span>
                </div>
              </div>
              <p className="job-summary">{t(job.summary)}</p>
              <ul className="job-points">
                {job.points.map((p, i) => (
                  <li key={i}><CheckCircle2 size={16} aria-hidden="true" />{t(p)}</li>
                ))}
              </ul>
              <ul className="chips">
                {job.tags.map((tag) => <li key={tag}><TechIcon name={tag} />{tag}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="edu">
        <span className="job-badge" aria-hidden="true"><GraduationCap size={22} strokeWidth={1.6} /></span>
        <div>
          <p className="edu-label">{t({ en: "Education", vi: "Học vấn" })}</p>
          <h3>{t(education.degree)}</h3>
          <p className="edu-school">{t(education.school)}</p>
        </div>
        <span className="edu-period"><CalendarDays size={14} aria-hidden="true" />{education.period}</span>
      </div>
    </section>
  );
}
