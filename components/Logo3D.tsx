"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A "K" monogram built from one outline: stem plus two arms.
function kShape() {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [-0.35, -0.5], [-0.07, -0.5], [-0.07, -0.05], [0.28, -0.5], [0.62, -0.5],
    [0.17, 0.08], [0.6, 0.5], [0.26, 0.5], [-0.07, 0.13], [-0.07, 0.5], [-0.35, 0.5],
  ];
  pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x - 0.135, y) : s.lineTo(x - 0.135, y)));
  s.closePath();
  return s;
}

function Mark({ hot }: { hot: React.RefObject<boolean> }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(kShape(), {
      depth: 0.24, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: 4, curveSegments: 1,
    });
    g.center();
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // a gentle sway keeps the K readable; hovering adds a livelier wobble
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.9) * 0.5 + state.pointer.x * 0.6 + (hot.current ? Math.sin(t * 5) * 0.25 : 0);
      group.current.rotation.x = -state.pointer.y * 0.45 + Math.sin(t * 0.7) * 0.08;
      group.current.position.y = Math.sin(t * 1.4) * 0.03;
    }
    if (ring.current) ring.current.rotation.z = t * 1.1;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#4fd1c5" metalness={0.55} roughness={0.22} emissive="#0f6f68" emissiveIntensity={0.55} />
      </mesh>

      {/* orbit ring tilted around the K, with a glowing bead travelling on it */}
      <group rotation={[1.15, 0.2, 0]}>
        <group ref={ring}>
          <mesh>
            <torusGeometry args={[0.92, 0.012, 8, 96]} />
            <meshBasicMaterial color="#ffb86b" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.92, 0, 0]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshBasicMaterial color="#ffd9a8" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Small live 3D mark: a solid, lit "K" with an orbiting ring.
export default function Logo3D() {
  const hot = useRef(false);
  return (
    <span
      className="logo3d"
      aria-hidden="true"
      onPointerEnter={() => (hot.current = true)}
      onPointerLeave={() => (hot.current = false)}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.75], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2.5, 3, 4]} intensity={2.4} />
        <pointLight position={[-2.5, -1, 2]} intensity={5} color="#ffb86b" />
        <Mark hot={hot} />
      </Canvas>
    </span>
  );
}
