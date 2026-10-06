"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useLang } from "@/lib/i18n";
import { hero, profile } from "@/lib/content";
import Stats from "./Stats";

export default function Hero() {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);

  // The one orchestrated moment on the page: the name rises letter by letter,
  // then the rest of the copy settles in.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".h-char", { yPercent: 120, rotate: 12, opacity: 0, duration: 0.9, stagger: 0.045, ease: "back.out(1.6)" })
        .from(".h-fade", { opacity: 0, y: 14, duration: 0.7, stagger: 0.1 }, "-=0.45");
    }, root);
    return () => ctx.revert();
  }, []);

  const [first, ...rest] = profile.name.split(" ");

  return (
    <section ref={root} className="hero" id="top">
      <div className="hero-inner">
        <p className="hero-role h-fade">{t(hero.role)}</p>
        <h1 className="hero-name" aria-label={profile.name}>
          {[first, rest.join(" ")].map((line) => (
            <span key={line} className="h-line" aria-hidden="true">
              {Array.from(line.normalize("NFC")).map((c, i) => (
                <span key={i} className="h-char">{c === " " ? " " : c}</span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero-lead h-fade">{t(hero.lead)}</p>
        <p className="hero-body h-fade">{t(hero.body)}</p>
        <div className="hero-cta h-fade">
          <a className="btn btn-primary" href="#work">{t(hero.ctaWork)}</a>
          <a className="btn btn-quiet" href={`mailto:${profile.email}`}>{t(hero.ctaMail)}</a>
        </div>
        <Stats />
      </div>
      <p className="hero-caption h-fade">{t(hero.caption)}</p>
    </section>
  );
}
