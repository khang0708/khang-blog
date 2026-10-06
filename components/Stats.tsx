"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Users, Building2, ClipboardCheck, CalendarClock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { yearsOfExperience } from "@/lib/content";

const stats = [
  { icon: Users, to: 35000, suffix: "+", label: { en: "concurrent users", vi: "người dùng đồng thời" } },
  { icon: Building2, to: 200, suffix: "+", label: { en: "corporate clients", vi: "doanh nghiệp" } },
  { icon: ClipboardCheck, to: 500000, suffix: "+", label: { en: "test sessions", vi: "lượt kiểm tra" } },
  { icon: CalendarClock, to: yearsOfExperience(), suffix: "+", label: { en: "years building", vi: "năm kinh nghiệm" } },
];

export default function Stats() {
  const { t } = useLang();
  const root = useRef<HTMLUListElement>(null);

  // Numbers count up once on load.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      root.current?.querySelectorAll<HTMLElement>("[data-to]").forEach((el) => {
        const o = { v: 0 };
        gsap.to(o, {
          v: Number(el.dataset.to),
          duration: 2,
          delay: 0.9,
          ease: "power2.out",
          onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-US")),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <ul ref={root} className="stats h-fade">
      {stats.map(({ icon: Icon, to, suffix, label }) => (
        <li key={label.en} className="stat">
          <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
          <strong>
            <span data-to={to}>{to.toLocaleString("en-US")}</span>
            {suffix}
          </strong>
          <span>{t(label)}</span>
        </li>
      ))}
    </ul>
  );
}
