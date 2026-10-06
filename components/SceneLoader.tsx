"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneLoader() {
  return <Scene />;
}
