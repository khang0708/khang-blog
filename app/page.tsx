import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Work from "@/components/Work";
import Stack from "@/components/Stack";
import Contact from "@/components/Contact";
import Marquee from "@/components/Marquee";
import Motion from "@/components/Motion";

// The years of experience are computed from a date, so rebuild the static page once a day.
export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <Motion />
      <Hero />
      <Marquee />
      <div className="after-hero">
        <Experience />
        <Work />
        <Stack />
        <Contact />
      </div>
    </>
  );
}
