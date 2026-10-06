"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Particles from "./Particles";
import Shapes from "./Shapes";

export default function Scene() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Particles reduced={reduced} />
        <Shapes reduced={reduced} />
      </Canvas>
    </div>
  );
}
