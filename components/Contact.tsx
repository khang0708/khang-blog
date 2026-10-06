"use client";

import { useState } from "react";
import { siGithub } from "simple-icons";
import { Mail, MapPin, Copy, Check, ArrowUpRight, ArrowRight, Send, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { profile } from "@/lib/content";
import { openChat } from "@/lib/chatBridge";
import { track } from "@/lib/track";

// simple-icons ships no LinkedIn, so draw the "in" mark by hand.
const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="9" width="4" height="12" rx="0.5" />
    <circle cx="5" cy="5" r="2.2" />
    <path d="M10 9h3.8v1.7c.6-1.1 1.9-2 3.7-2 3.1 0 3.5 2.1 3.5 4.6V21h-4v-6.3c0-1.3-.1-2.5-1.600-2.500s-1.800 1.200-1.800 2.500V21h-4z" />
  </svg>
);

export default function Contact() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { href: profile.linkedin, label: "LinkedIn", sub: { en: "Let's connect", vi: "Kết nối với tôi" }, icon: <LinkedInMark /> },
    {
      href: profile.github, label: "GitHub", sub: { en: "See the code", vi: "Xem mã nguồn" },
      icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d={siGithub.path} /></svg>,
    },
  ];

  return (
    <section className="section contact" id="contact">
      <div className="contact-panel">
        <span className="contact-ring" aria-hidden="true" />
        <p className="contact-status"><span aria-hidden="true" />{t({ en: "Available for new work", vi: "Đang sẵn sàng nhận việc mới" })}</p>
        <h2 className="contact-title">
          {t({ en: "Open to new opportunities and ", vi: "Sẵn sàng cho cơ hội và " })}
          <em>{t({ en: "collaborations.", vi: "hợp tác mới." })}</em>
        </h2>

        <button type="button" className="contact-ai" onClick={() => { track("contact_ai_open"); openChat({ mode: "lead" }); }}>
          <span className="contact-ai-icon"><Sparkles size={22} aria-hidden="true" /></span>
          <span className="contact-ai-text">
            <strong>{t({ en: "Let the AI assistant take your details", vi: "Nhờ trợ lý AI ghi nhận thông tin" })}</strong>
            <small>{t({ en: "Tell it who you are and what you need. It passes everything to Khang, no email to write.", vi: "Cho trợ lý biết bạn là ai và bạn cần gì, trợ lý sẽ chuyển tất cả cho Khang, không cần soạn email." })}</small>
          </span>
          <ArrowRight size={20} className="contact-ai-arrow" aria-hidden="true" />
        </button>
        <p className="contact-or"><span>{t({ en: "or reach me directly", vi: "hoặc liên hệ trực tiếp" })}</span></p>

        <div className="contact-mailbox">
          <a className="contact-mail" href={`mailto:${profile.email}`} onClick={() => track("email_click")}>
            <Mail size={22} aria-hidden="true" />
            <span>{profile.email}</span>
          </a>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => { track("contact_ai_open"); openChat({ mode: "lead" }); }}>
            <Send size={20} aria-hidden="true" />{t({ en: "Let's work together", vi: "Cùng hợp tác nhé" })}<ArrowRight size={20} aria-hidden="true" className="cta-arrow" />
          </button>
          <button type="button" className="btn btn-quiet" onClick={copy}>
            {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            {copied ? t({ en: "Copied", vi: "Đã sao chép" }) : t({ en: "Copy email", vi: "Sao chép email" })}
          </button>
        </div>

        <div className="contact-links">
          {links.map((l) => (
            <a key={l.label} className="contact-link" href={l.href} target="_blank" rel="noreferrer">
              <span className="contact-link-icon">{l.icon}</span>
              <span><strong>{l.label}</strong><small>{t(l.sub)}</small></span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          ))}
          <p className="contact-loc"><MapPin size={20} aria-hidden="true" />{t(profile.location)}</p>
        </div>
      </div>
    </section>
  );
}
