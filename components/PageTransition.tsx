"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

// Circular wipe: a disc grows from the click point to cover the page, the route
// changes underneath, then the disc shrinks back to the same point.
// The disc is moved with transform only (compositor-driven), so it stays smooth on phones.
export default function PageTransition() {
  const root = useRef<HTMLDivElement>(null);
  const covered = useRef(false);
  const radius = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;

      e.preventDefault();
      e.stopPropagation(); // capture phase: keep next/link from navigating first
      if (covered.current) return;
      covered.current = true;

      // Keyboard activation reports 0,0, so fall back to the link's centre.
      const r = a.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2;
      const y = e.clientY || r.top + r.height / 2;
      // radius that reaches the farthest corner
      radius.current = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const size = radius.current * 2;
      gsap.set(root.current, { width: size, height: size, left: x - radius.current, top: y - radius.current, scale: 0, autoAlpha: 1 });
      gsap.to(root.current, {
        scale: 1, duration: 0.55, ease: "power3.in",
        onStart: () => window.dispatchEvent(new CustomEvent("scene-pause", { detail: true })),
        onComplete: () => router.push(url.pathname + url.search + url.hash),
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // New route is mounted: lift the curtain.
  useEffect(() => {
    if (!covered.current) return;
    covered.current = false;
    window.dispatchEvent(new CustomEvent("scene-pause", { detail: false }));
    gsap.to(root.current, {
      scale: 0, duration: 0.6, ease: "power3.out", delay: 0.1,
      onComplete: () => { gsap.set(root.current, { autoAlpha: 0 }); },
    });
  }, [pathname]);

  return (
    <div ref={root} className="curtain" aria-hidden="true" />
  );
}
