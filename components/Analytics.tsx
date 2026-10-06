"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackView } from "@/lib/track";

// Counts a page view on every route change. Renders nothing.
export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    trackView(pathname);
  }, [pathname]);
  return null;
}
