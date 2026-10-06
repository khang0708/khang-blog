"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/lib/i18n";

const R = 22;
const C = 2 * Math.PI * R;

// Floating button: appears when you scroll back up past the first screen; the ring shows how far down the page you are.
export default function BackToTop() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = scrollY;
    let up = false;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      ring.current?.setAttribute("stroke-dashoffset", String(C * (1 - p)));
      // shown only while scrolling back up, so it never covers the text being read
      const dy = scrollY - last;
      last = scrollY;
      if (Math.abs(dy) > 6) up = dy < 0;
      // the footer has its own button, so step aside once it is on screen
      const footer = document.querySelector(".footer")?.getBoundingClientRect().top ?? Infinity;
      setShow(up && scrollY > innerHeight * 0.6 && footer > innerHeight - 40);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${show ? "is-on" : ""}`}
      aria-label={t({ en: "Back to top", vi: "Lên đầu trang" })}
      tabIndex={show ? 0 : -1}
      onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={R} className="to-top-track" />
        <circle ref={ring} cx="26" cy="26" r={R} className="to-top-ring" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
