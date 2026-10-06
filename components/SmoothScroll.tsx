"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scroll";

export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      scrollState.hero = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      ScrollTrigger.update();
    };

    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on("scroll", update);
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }
    update();

    return () => {
      if (lenis && tick) {
        gsap.ticker.remove(tick);
        lenis.destroy();
      } else {
        window.removeEventListener("scroll", update);
      }
    };
  }, []);

  return null;
}
