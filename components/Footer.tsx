"use client";

import Link from "next/link";
import { siGithub } from "simple-icons";
import { ArrowUp, Mail } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { profile } from "@/lib/content";

const links = [
  { href: "/#experience", en: "Experience", vi: "Kinh nghiệm" },
  { href: "/#work", en: "Work", vi: "Dự án" },
  { href: "/#stack", en: "Stack", vi: "Công nghệ" },
  { href: "/blog", en: "Blog", vi: "Blog" },
  { href: "/#contact", en: "Contact", vi: "Liên hệ" },
];

export default function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <strong>{profile.name}</strong>
          <p>{t({ en: "Senior fullstack developer building scalable web platforms, payments and AI features.", vi: "Lập trình viên Fullstack Senior xây nền tảng web chịu tải lớn, thanh toán và tính năng AI." })}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {links.map((l) => <Link key={l.href} href={l.href}>{l[lang]}</Link>)}
        </nav>

        <div className="footer-social">
          <a href={`mailto:${profile.email}`} aria-label="Email"><Mail size={20} /></a>
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={siGithub.path} /></svg>
          </a>
          <button type="button" className="footer-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {t({ en: "Back to top", vi: "Lên đầu trang" })}<ArrowUp size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="footer-mark" aria-hidden="true">{profile.shortName}</p>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{t({ en: "Built with Next.js, three.js and GSAP", vi: "Xây bằng Next.js, three.js và GSAP" })}</span>
      </div>
    </footer>
  );
}
