"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 70;
const ROWS = 35;
const COUNT = COLS * ROWS;
const SPACING = 1.2;

function BreathingStructuredGrid({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const basePositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Center the grid and push back
        arr.push([
          (c - COLS / 2) * SPACING,
          (r - ROWS / 2) * SPACING,
          -15, // pushed back to prevent clipping
        ]);
      }
    }
    return arr;
  }, []);

  const purple = useMemo(() => new THREE.Color("#6366f1"), []);
  const cyan = useMemo(() => new THREE.Color("#06b6d4"), []);
  const pink = useMemo(() => new THREE.Color("#ec4899"), []);
  const tempCol = useMemo(() => new THREE.Color(), []);
  const materialReady = useRef(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    
    const { width, height } = state.viewport;
    // Map mouse to larger world coordinates. The grid is further back, so multiply more.
    const mx = (mouse.current?.x ?? 0) * (width / 2) * 2;
    const my = (mouse.current?.y ?? 0) * (height / 2) * 2;

    basePositions.forEach(([bx, by, bz], i) => {
      // 1. Continuous Wave Perturbation
      // Creating a gentle rolling wave based on X and time, with reduced amplitude and pseudo-random phase
      const phaseOffset = (bx * by) * 0.05;
      const waveZ = (Math.sin(bx * 0.3 + t * 1.5 + phaseOffset) * 0.75) + 
                    (Math.cos(by * 0.2 + t * 1.0 + phaseOffset) * 0.5);
      
      let pz = bz + waveZ;
      let px = bx;
      let py = by;

      // 2. Mouse Interaction
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactRadius = 12;
      
      let influence = 0;
      if (dist < interactRadius) {
        // smooth step influence
        influence = Math.pow(1 - dist / interactRadius, 2);
        // gently pull them slightly forward
        pz += influence * 4; 
      }

      dummy.position.set(px, py, pz);

      // 3. Capsule Sizing & Orientation
      const baseScale = 0.05 + (Math.sin(bx * by + t) * 0.02); 
      const activeScale = 0.3; 
      const scale = baseScale + (influence * activeScale);

      // Stretch into a capsule shape based on influence.
      dummy.scale.set(scale, scale * (1 + influence * 1), scale);
      
      // Orient capsule along Z axis by rotating 90 degrees on X
      dummy.rotation.x = Math.PI / 2;
      // Add slight jitter/wave to the pointing angle
      dummy.rotation.z = Math.sin(bx * 0.1 + t + phaseOffset) * 0.1;
      dummy.rotation.y = Math.cos(by * 0.1 + t + phaseOffset) * 0.1;
      
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);

      // 4. Animated Color Gradient
      const xRatio = (bx + (COLS * SPACING) / 2) / (COLS * SPACING); // 0 to 1
      const yRatio = (by + (ROWS * SPACING) / 2) / (ROWS * SPACING); // 0 to 1

      // Animated diagonal parameter (0 → 1 across the grid, drifting over time)
      const drift = t * 0.15;
      const diag = (xRatio * 0.5 + yRatio * 0.5)
        + Math.sin(xRatio * Math.PI * 2 + drift) * 0.12
        + Math.cos(yRatio * Math.PI * 2 - drift * 0.7) * 0.12;
      // Clamp to 0–1
      const p = Math.min(1, Math.max(0, diag));

      // Smooth three-stop gradient: purple (0) → cyan (0.5) → pink (1)
      if (p < 0.5) {
        const seg = p * 2; // 0–1 within first half
        tempCol.copy(purple).lerp(cyan, seg);
      } else {
        const seg = (p - 0.5) * 2; // 0–1 within second half
        tempCol.copy(cyan).lerp(pink, seg);
      }

      // Subtly brighten when influenced by mouse, preserving hue
      if (influence > 0) {
         const boost = 1 + influence * 0.35;
         tempCol.r = Math.min(tempCol.r * boost, 1);
         tempCol.g = Math.min(tempCol.g * boost, 1);
         tempCol.b = Math.min(tempCol.b * boost, 1);
      }
      
      ref.current!.setColorAt(i, tempCol);
    });

    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true;
    }

    // On first frame, force material to recompile now that instanceColor exists.
    // Without this, the shader compiles before setColorAt creates the buffer,
    // so USE_INSTANCING_COLOR is never enabled and all capsules render white.
    if (!materialReady.current) {
      materialReady.current = true;
      (ref.current.material as THREE.Material).needsUpdate = true;
    }
  });

  const geo = useMemo(() => {
    // A capsule geometry. Radius 0.5, length 1 so it's noticeably oblong when scaled Y.
    return new THREE.CapsuleGeometry(0.5, 1, 4, 8);
  }, []);

  return (
    <instancedMesh ref={ref} args={[geo, undefined, COUNT]}>
      <meshBasicMaterial
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
}

export default function ParticleGrid() {
  const mouse = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Check if pointer is within the element bounds
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      } else {
        mouse.current.x = -1000;
        mouse.current.y = -1000;
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      className="particle-grid-wrap"
      ref={wrapRef}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <BreathingStructuredGrid mouse={mouse} />
      </Canvas>
    </div>
  );
}
