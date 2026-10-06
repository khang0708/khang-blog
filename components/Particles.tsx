"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

export const POINT_COUNT = 35000;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uPointer;
  uniform vec2  uOffset;
  uniform float uSize;
  uniform float uPixel;
  attribute vec3  aField;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float m = smoothstep(0.0, 1.0, uProgress);

    // swarm: a sphere that breathes and slowly turns
    vec3 s = position;
    float t = uTime * 0.15 + aSeed * 6.2831;
    s += 0.07 * vec3(sin(t * 3.0 + s.y * 2.0), cos(t * 2.5 + s.z * 2.0), sin(t * 2.0 + s.x * 2.0));
    float a = uTime * 0.08;
    s.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * s.xz;

    // field: a wide wave that sits low in the frame
    vec3 f = aField;
    f.y += sin(f.x * 0.55 + uTime * 0.35) * 0.55 + cos(f.z * 0.8 + uTime * 0.25) * 0.4 - 2.6;

    vec3 p = mix(s, f, m);
    p.xy += uOffset * (1.0 - m);

    // pointer pushes nearby points away
    vec2 d = p.xy - uPointer;
    float dist = length(d);
    float push = smoothstep(1.5, 0.0, dist);
    p.xy += normalize(d + 1e-4) * push * 0.55;
    p.z  += push * 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * uPixel * (1.0 / -mv.z) * (0.55 + aSeed * 0.9), 1.0, 7.0 * uPixel);

    vAlpha = mix(0.95, 0.5, m) * (0.45 + 0.55 * aSeed);
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    gl_FragColor = vec4(mix(uColorA, uColorB, vSeed), a);
  }
`;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Particles({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(99, 99));
  const progress = useRef(0);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const rand = mulberry32(1337);
    const position = new Float32Array(POINT_COUNT * 3);
    const field = new Float32Array(POINT_COUNT * 3);
    const seed = new Float32Array(POINT_COUNT);
    for (let i = 0; i < POINT_COUNT; i++) {
      // shell-biased sphere
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const r = 1.55 * (0.55 + 0.45 * Math.cbrt(rand()));
      const s = Math.sqrt(1 - u * u);
      position[i * 3] = r * s * Math.cos(phi);
      position[i * 3 + 1] = r * u;
      position[i * 3 + 2] = r * s * Math.sin(phi);
      // wide field
      field[i * 3] = (rand() - 0.5) * 20;
      field[i * 3 + 1] = (rand() - 0.5) * 0.4;
      field[i * 3 + 2] = -9 + rand() * 11;
      seed[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("aField", new THREE.BufferAttribute(field, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uSize: { value: 9 },
      uPixel: { value: 1 },
      uColorA: { value: new THREE.Color("#a8efe6") },
      uColorB: { value: new THREE.Color("#2fa89d") },
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    if (!reduced) u.uTime.value += delta;
    u.uPixel.value = state.gl.getPixelRatio();

    // ease toward the scroll target so the morph feels weighty
    progress.current += (scrollState.hero - progress.current) * Math.min(1, delta * 4);
    u.uProgress.value = progress.current;

    // cloud sits right of the text on wide screens, above it on narrow ones
    const wide = viewport.width / viewport.height > 1.1;
    u.uOffset.value.set(wide ? viewport.width * 0.2 : 0, wide ? 0.1 : viewport.height * 0.2);

    if (!reduced) {
      const tx = (state.pointer.x * viewport.width) / 2;
      const ty = (state.pointer.y * viewport.height) / 2;
      pointer.current.x += (tx - pointer.current.x) * Math.min(1, delta * 8);
      pointer.current.y += (ty - pointer.current.y) * Math.min(1, delta * 8);
      u.uPointer.value.copy(pointer.current);
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
