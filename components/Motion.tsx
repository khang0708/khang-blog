"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Page-wide motion: scroll reveals, mouse tilt on cards, magnetic buttons, cursor glow.
export default function Motion() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Titles and rows rise in as they enter; items in the same batch stagger.
      const targets = ".section-title, .work-card, .stack-card, .job, .contact-panel";
      gsap.set(targets, { opacity: 0, y: 48 });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, overwrite: true }),
      });

      // Tech chips pop in after their card.
      gsap.set(".chips li", { opacity: 0, scale: 0.7 });
      ScrollTrigger.batch(".chips", {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          els.forEach((ul) =>
            gsap.to(ul.children, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.04, delay: 0.25 }),
          ),
      });
    });

    // Cards tilt toward the pointer; the glow follows it across the page.
    const root = document.documentElement;
    // The closest button within 90px of the pointer leans toward it (max 6px, less
    // than the gap between buttons); every other button settles back, so neighbours never collide.
    const magnet = (e: PointerEvent) => {
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      const rest = new Map<HTMLElement, { dx: number; dy: number }>();
      document.querySelectorAll<HTMLElement>(".btn").forEach((b) => {
        const r = b.getBoundingClientRect();
        // measure from the resting position, not the displaced one, so the pull doesn't feed back on itself
        const dx = e.clientX - (r.left + r.width / 2 - Number(gsap.getProperty(b, "x")));
        const dy = e.clientY - (r.top + r.height / 2 - Number(gsap.getProperty(b, "y")));
        rest.set(b, { dx, dy });
        const gapX = Math.max(0, Math.abs(dx) - r.width / 2);
        const gapY = Math.max(0, Math.abs(dy) - r.height / 2);
        const d = Math.hypot(gapX, gapY);
        if (d < 90 && d < bestD) { best = b; bestD = d; }
      });
      rest.forEach(({ dx, dy }, b) => {
        const on = b === best;
        gsap.to(b, {
          x: on ? Math.max(-6, Math.min(6, dx * 0.15)) : 0,
          y: on ? Math.max(-6, Math.min(6, dy * 0.15)) : 0,
          duration: on ? 0.3 : 0.6,
          ease: on ? "power2.out" : "elastic.out(1, 0.5)",
          overwrite: "auto",
        });
      });
    };
    const move = (e: PointerEvent) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
      if (e.pointerType === "mouse") magnet(e);
      const jc = (e.target as HTMLElement).closest<HTMLElement>(".job-card, .work-card");
      if (jc) {
        const jr = jc.getBoundingClientRect();
        jc.style.setProperty("--cx", `${e.clientX - jr.left}px`);
        jc.style.setProperty("--cy", `${e.clientY - jr.top}px`);
      }
      const card = (e.target as HTMLElement).closest<HTMLElement>(".stack-card, .work-card, .job-card, .edu");
      if (!card) return;
      const k = card.matches(".job-card, .edu") ? 8 : 10; // wide cards get a gentler tilt
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: x * k, rotateX: -y * k, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
    };
    const leave = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.<HTMLElement>(".stack-card, .work-card, .job-card, .edu");
      // moving between children of the same card is not leaving it
      if (card && !card.contains(e.relatedTarget as Node | null)) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerout", leave);

    return () => {
      ctx.revert();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
    };
  }, []);

  return null;
}
