"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Briefcase, Building2, MessageSquare, CalendarDays, Check, Copy, Mail, MapPin, Navigation, Sparkles, TrendingUp } from "lucide-react";
import { siGithub } from "simple-icons";
import { useLang } from "@/lib/i18n";
import { jobs, profile, projects, stack, yearsOfExperience } from "@/lib/content";
import { projectIcons } from "./projectIcons";
import TechIcon from "./TechIcon";

type Props = { arg: string; close: () => void };

const Chips = ({ items }: { items: string[] }) => (
  <ul className="chips">
    {items.map((s) => <li key={s}><TechIcon name={s} />{s}</li>)}
  </ul>
);

export function ProjectCard({ arg, close }: Props) {
  const { t } = useLang();
  const p = projects.find((x) => x.slug === arg);
  if (!p) return null;
  const Icon = projectIcons[p.slug] ?? Briefcase;
  return (
    <Link href={`/work/${p.slug}`} className="cc cc-project" onClick={close}>
      <div className="cc-top">
        <span className="cc-icon"><Icon size={20} aria-hidden="true" /></span>
        <strong>{p.name}</strong>
        <ArrowUpRight size={18} className="cc-arrow" aria-hidden="true" />
      </div>
      <p>{t(p.line)}</p>
      <span className="cc-pill"><TrendingUp size={13} aria-hidden="true" />{t(p.metric)}</span>
      <Chips items={p.stack.slice(0, 4)} />
      <span className="cc-cta">{t({ en: "View case study", vi: "Xem chi tiết dự án" })} →</span>
    </Link>
  );
}

export function JobCard({ arg, close }: Props) {
  const { t } = useLang();
  const j = jobs.find((x) => x.id === arg);
  if (!j) return null;
  return (
    <Link href="/#experience" className="cc cc-job" onClick={close}>
      <div className="cc-top">
        <span className="cc-icon"><Building2 size={20} aria-hidden="true" /></span>
        <div>
          <strong>{t(j.title)}</strong>
          <small>{j.company}</small>
        </div>
      </div>
      <div className="cc-row">
        <span className="cc-meta"><CalendarDays size={13} aria-hidden="true" />{t(j.period)}</span>
        <span className="cc-big">{j.metric.value}<small>{t(j.metric.label)}</small></span>
      </div>
      <Chips items={j.tags.slice(0, 5)} />
    </Link>
  );
}

export function SkillsCard({ arg }: Props) {
  const { t } = useLang();
  const g = stack.find((x) => x.group.en.toLowerCase() === arg.toLowerCase());
  if (!g) return null;
  return (
    <div className="cc cc-skills">
      <div className="cc-top">
        <span className="cc-icon"><Sparkles size={20} aria-hidden="true" /></span>
        <strong>{t(g.group)}</strong>
      </div>
      <Chips items={g.items} />
    </div>
  );
}

export function LiveCard({ openLive }: { openLive: () => void }) {
  const { t } = useLang();
  return (
    <button type="button" className="cc cc-live" onClick={openLive}>
      <span className="cc-icon"><MessageSquare size={20} aria-hidden="true" /></span>
      <span>
        <strong>{t({ en: "Chat with Khang directly", vi: "Nhắn trực tiếp cho Khang" })}</strong>
        <small>{t({ en: "Your message reaches him in real time", vi: "Tin nhắn được chuyển tới Khang ngay lập tức" })}</small>
      </span>
      <ArrowUpRight size={18} className="cc-arrow" aria-hidden="true" />
    </button>
  );
}

export function ContactCard() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <div className="cc cc-contact">
      <a className="cc-mail" href={`mailto:${profile.email}`}><Mail size={18} aria-hidden="true" />{profile.email}</a>
      <div className="cc-actions">
        <button type="button" onClick={copy}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? t({ en: "Copied", vi: "Đã chép" }) : t({ en: "Copy", vi: "Sao chép" })}
        </button>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d={siGithub.path} /></svg>GitHub
        </a>
      </div>
      <span className="cc-meta"><MapPin size={13} aria-hidden="true" />{t(profile.location)}</span>
    </div>
  );
}

const statItems = [
  { to: 35000, suffix: "+", label: { en: "concurrent users", vi: "người dùng đồng thời" } },
  { to: 200, suffix: "+", label: { en: "corporate clients", vi: "doanh nghiệp" } },
  { to: 500000, suffix: "+", label: { en: "test sessions", vi: "lượt kiểm tra" } },
  { to: yearsOfExperience(), suffix: "+", label: { en: "years building", vi: "năm kinh nghiệm" } },
];

function Count({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - t0) / 1200);
      setV(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v.toLocaleString("en-US")}</>;
}

export function StatsCard() {
  const { t } = useLang();
  return (
    <div className="cc cc-stats">
      {statItems.map((s) => (
        <div key={s.label.en}>
          <strong><Count to={s.to} />{s.suffix}</strong>
          <small>{t(s.label)}</small>
        </div>
      ))}
    </div>
  );
}

const sections: Record<string, { en: string; vi: string }> = {
  experience: { en: "Experience", vi: "Kinh nghiệm" },
  work: { en: "Selected work", vi: "Dự án" },
  stack: { en: "Tech stack", vi: "Công nghệ" },
  contact: { en: "Contact", vi: "Liên hệ" },
};

export function GotoButton({ arg, close }: Props) {
  const { t } = useLang();
  const s = sections[arg];
  if (!s) return null;
  return (
    <Link href={`/#${arg}`} className="cc-goto" onClick={close}>
      <Navigation size={15} aria-hidden="true" />
      {t({ en: `Show me: ${s.en}`, vi: `Đến phần: ${s.vi}` })}
    </Link>
  );
}
