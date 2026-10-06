"use client";

import { usePathname } from "next/navigation";
import SceneLoader from "./SceneLoader";
import SmoothScroll from "./SmoothScroll";
import PageTransition from "./PageTransition";
import Chatbot from "./Chatbot";
import BackToTop from "./BackToTop";
import Nav from "./Nav";
import Footer from "./Footer";
import Analytics from "./Analytics";

// The public site's frame (3D scene, nav, footer, chatbot...). The admin area gets a plain page with none of it.
export default function Chrome({ children }: { children: React.ReactNode }) {
  if (usePathname().startsWith("/admin")) return <main>{children}</main>;
  return (
    <>
      <Analytics />
      <SceneLoader />
      <SmoothScroll />
      <PageTransition />
      <Nav />
      <main>{children}</main>
      <Footer />
      <BackToTop />
      <Chatbot />
    </>
  );
}
