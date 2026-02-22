"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SYMBOLS = ["\u03C0", "e", "\u03C6", "\u03B3", "\u03B1"];
const PARTICLE_COUNT = 2000;
const HOLD_DURATION = 3;
const MORPH_DURATION = 1.8;

const COLOURS = [
  new THREE.Color("#6366f1"),
  new THREE.Color("#8b5cf6"),
  new THREE.Color("#06b6d4"),
  new THREE.Color("#ec4899"),
  new THREE.Color("#3b82f6"),
];

function samplePositionsFromText(
  text: string,
  count: number
): Float32Array {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(count * 3);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "white";
  ctx.font = `bold ${size * 0.65}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2);

  const imageData = ctx.getImageData(0, 0, size, size);
  const edges: [number, number][] = [];
  const interior: [number, number][] = [];

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      if (imageData.data[(y * size + x) * 4 + 3] > 128) {
        const isEdge =
          x <= 2 ||
          x >= size - 3 ||
          y <= 2 ||
          y >= size - 3 ||
          imageData.data[((y - 2) * size + x) * 4 + 3] <= 128 ||
          imageData.data[((y + 2) * size + x) * 4 + 3] <= 128 ||
          imageData.data[(y * size + (x - 2)) * 4 + 3] <= 128 ||
          imageData.data[(y * size + (x + 2)) * 4 + 3] <= 128;
        if (isEdge) edges.push([x, y]);
        else interior.push([x, y]);
      }
    }
  }

  const positions = new Float32Array(count * 3);
  const spread = 6.5; // Increased overall symbol size
  const edgeTarget = Math.floor(count * 0.75);

  for (let i = 0; i < count; i++) {
    let pool: [number, number][];
    if (i < edgeTarget && edges.length > 0) {
      pool = edges;
    } else if (interior.length > 0) {
      pool = interior;
    } else if (edges.length > 0) {
      pool = edges;
    } else {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      continue;
    }

    const p = pool[Math.floor(Math.random() * pool.length)];
    const jitter = i < edgeTarget ? (Math.random() - 0.5) * 0.06 : 0;
    positions[i * 3] = (p[0] / size - 0.5) * spread + jitter;
    positions[i * 3 + 1] = -(p[1] / size - 0.5) * spread + jitter;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  return positions;
}

function ParticleField({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  const symbolPositions = useMemo(
    () => SYMBOLS.map((s) => samplePositionsFromText(s, PARTICLE_COUNT)),
    []
  );

  const currentPos = useRef(
    (() => {
      const arr = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 10;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
      return arr;
    })()
  );

  const phase = useRef(0);
  const idx = useRef(0);

  const pData = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        off: Math.random() * Math.PI * 2,
        spd: 0.3 + Math.random() * 0.6,
        wob: 0.008 + Math.random() * 0.02,
        baseScale: 0.006 + Math.random() * 0.014,
        depthRand: Math.random(),
      })),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    phase.current += delta;

    const total = HOLD_DURATION + MORPH_DURATION;

    if (phase.current >= total) {
      phase.current -= total;
      idx.current = (idx.current + 1) % SYMBOLS.length;
    }

    const p = phase.current;
    const ci = idx.current;
    const ni = (ci + 1) % SYMBOLS.length;

    let morph = 0;
    if (p >= HOLD_DURATION) {
      morph = (p - HOLD_DURATION) / MORPH_DURATION;
      // Linear or slightly fast-in morph prevents stalling at ends
      morph = Math.pow(morph, 0.85);
    }

    const from = symbolPositions[ci];
    const to = symbolPositions[ni];
    const cFrom = COLOURS[ci];
    const cTo = COLOURS[ni];
    colour.lerpColors(cFrom, cTo, morph);

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.copy(colour);
    mat.emissive.copy(colour);

    // Higher lerp factor during morph to reduce lag before transitions
    const baseLf = morph > 0 ? 0.14 : 0.09;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const d = pData[i];
      const tx =
        from[i3] +
        (to[i3] - from[i3]) * morph +
        Math.sin(t * d.spd + d.off) * d.wob;
      const ty =
        from[i3 + 1] +
        (to[i3 + 1] - from[i3 + 1]) * morph +
        Math.cos(t * d.spd * 0.7 + d.off) * d.wob;
      const tz = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * morph;

      let targetX = tx;
      let targetY = ty;
      let targetZ = tz;

      if (mouse.current) {
        const mx = mouse.current.x * 2.5; // Adjusted mouse mapped area
        const my = mouse.current.y * 2.0;
        const dx = currentPos.current[i3] - mx;
        const dy = currentPos.current[i3 + 1] - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const avoidR = 0.5; // Lower range
        if (dist < avoidR && dist > 0) {
          const force = (avoidR - dist) / avoidR;
          targetX += (dx / dist) * force * 0.5; // Lower repel
          targetY += (dy / dist) * force * 0.5; // Lower repel
          targetZ += force * 0.15;
        }
      }

      const lf = baseLf + d.depthRand * 0.04;
      currentPos.current[i3] += (targetX - currentPos.current[i3]) * lf;
      currentPos.current[i3 + 1] += (targetY - currentPos.current[i3 + 1]) * lf;
      currentPos.current[i3 + 2] += (targetZ - currentPos.current[i3 + 2]) * lf;

      dummy.position.set(
        currentPos.current[i3],
        currentPos.current[i3 + 1],
        currentPos.current[i3 + 2]
      );

      // Depth of field: particles near z=0 are sharp/small, far = softer/larger
      const z = currentPos.current[i3 + 2];
      const dofDist = Math.abs(z);
      const focus = Math.exp(-dofDist * 0.6);
      const morphPulse = morph > 0 ? morph * (1 - morph) * 0.006 : 0;
      const s = (d.baseScale * (0.7 + 0.3 * focus) + dofDist * 0.002 + morphPulse) * 1.4;

      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Group rotation removed in favour of particle repulsion
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, PARTICLE_COUNT]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </group>
  );
}

function AmbientDust() {
  const count = 200;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pts = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 16,
        y: (Math.random() - 0.5) * 12,
        z: -2 - Math.random() * 6,
        s: 0.2 + Math.random() * 0.3,
        o: Math.random() * Math.PI * 2,
        sc: 0.004 + Math.random() * 0.008,
      })),
    []
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    pts.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.s * 0.4 + p.o) * 0.5,
        p.y + Math.sin(t * p.s + p.o) * 0.4,
        p.z
      );
      const depthScale = 1 + (p.z + 2) * 0.04;
      dummy.scale.setScalar(p.sc * Math.max(0.5, depthScale));
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color="#6366f1"
        emissive="#6366f1"
        emissiveIntensity={0.25}
        transparent
        opacity={0.15}
      />
    </instancedMesh>
  );
}

export default function HeroScene() {
  const mouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    },
    []
  );

  return (
    <div className="hero-scene-container" onPointerMove={handlePointerMove}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#06b6d4" />
        <ParticleField mouse={mouse} />
        <AmbientDust />
      </Canvas>
    </div>
  );
}
