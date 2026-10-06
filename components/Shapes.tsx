"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { scrollState } from "@/lib/scroll";

// Floating wireframe solids that orbit the particle sphere in the hero
// and shrink away as you scroll.
const items = [
  { geo: "ico", pos: [2.3, 1.4, 0.5], size: 0.45, color: "#ffb86b", spin: 0.5 },
  { geo: "torus", pos: [2.5, -0.2, 0.8], size: 0.5, color: "#4fd1c5", spin: 0.7 },
  { geo: "oct", pos: [1.9, -1.6, 1.0], size: 0.4, color: "#a8efe6", spin: 0.6 },
  { geo: "box", pos: [0.9, 2.0, 0.3], size: 0.38, color: "#ffb86b", spin: 0.4 },
] as const;

export default function Shapes({ reduced }: { reduced: boolean }) {
  const root = useRef<Group>(null);
  const kids = useRef<(Group | null)[]>([]);
  const { viewport } = useThree();

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = reduced ? 0 : state.clock.elapsedTime;
    const wide = viewport.width / viewport.height > 1.1;
    g.position.set(wide ? viewport.width * 0.2 : 0, wide ? 0.1 : viewport.height * 0.2, 0);
    g.scale.setScalar(Math.max(0.0001, 1 - scrollState.hero * 1.2));
    // slow orbit plus parallax toward the pointer
    g.rotation.y += (t * 0.12 + state.pointer.x * 0.5 - g.rotation.y) * 0.05;
    g.rotation.x += (-state.pointer.y * 0.3 - g.rotation.x) * 0.05;
    kids.current.forEach((k, i) => {
      if (!k) return;
      k.rotation.x = t * items[i].spin;
      k.rotation.y = t * items[i].spin * 1.3;
      k.position.y = items[i].pos[1] + Math.sin(t * 0.8 + i * 1.7) * 0.18;
    });
  });

  return (
    <group ref={root}>
      {items.map((it, i) => (
        <group key={i} ref={(el) => { kids.current[i] = el; }} position={[...it.pos]}>
          <mesh scale={it.size}>
            {it.geo === "ico" && <icosahedronGeometry args={[1, 0]} />}
            {it.geo === "torus" && <torusGeometry args={[1, 0.35, 12, 28]} />}
            {it.geo === "oct" && <octahedronGeometry args={[1, 0]} />}
            {it.geo === "box" && <boxGeometry args={[1.3, 1.3, 1.3]} />}
            <meshBasicMaterial color={it.color} wireframe transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
