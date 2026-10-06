"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { profile } from "@/lib/content";

const Logo3D = dynamic(() => import("./Logo3D"), { ssr: false });

const links = [
  { href: "/#experience", en: "Experience", vi: "Kinh nghiệm" },
  { href: "/#work", en: "Work", vi: "Dự án" },
  { href: "/#stack", en: "Stack", vi: "Công nghệ" },
  { href: "/blog", en: "Blog", vi: "Blog" },
  { href: "/#contact", en: "Contact", vi: "Liên hệ" },
];

export default function Nav() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <Link href="/" className="nav-mark" onClick={() => setOpen(false)}>
        <Logo3D />
        {profile.shortName}
      </Link>

      <nav className={`nav-links ${open ? "is-open" : ""}`} aria-label="Primary">
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l[lang]}
          </Link>
        ))}
      </nav>

      <div className="nav-right">
        <div className="lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button type="button" aria-pressed={lang === "vi"} onClick={() => setLang("vi")}>
            VI
          </button>
        </div>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
