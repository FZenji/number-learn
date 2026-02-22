"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 12000;
const RADIUS = 35;
const ARMS = 4;
const ARM_SPREAD = 0.5;
const CORE_RADIUS = 2;

function SwirlingGalaxy() {
  const ref = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    const c1 = new THREE.Color("#8b5cf6"); // Purple
    const c2 = new THREE.Color("#06b6d4"); // Cyan
    const c3 = new THREE.Color("#ec4899"); // Pink
    const tempCol = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // 1. Distance from center (power law to cluster tightly at core)
      const r = Math.pow(Math.random(), 3) * RADIUS;

      // 2. Base angle based on arms and distance (spiral effect)
      const armIndex = i % ARMS;
      const armAngle = (armIndex / ARMS) * Math.PI * 2;
      
      // The further out, the more it lags behind in rotation
      const spiralOffset = r * 0.4;
      
      // Random spread around the arm, decreasing closer to center
      const spread = (Math.random() - 0.5) * ARM_SPREAD * (1 + r * 0.2);
      
      const angle = armAngle + spiralOffset + spread;

      // 3. Convert to cartesian 
      // Add slight z-variance to make it a fat disc
      const diskThickness = (Math.random() - 0.5) * (CORE_RADIUS + r * 0.05);
      
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = diskThickness;

      positions[i * 3] = x;
      positions[i * 3 + 1] = z; // swap Y and Z so it lays flat relative to camera view from 'top' if rotated
      positions[i * 3 + 2] = y;

      // 4. Color logic
      // Core is hot white/cyan, edges are purple/pink
      const distRatio = Math.min(r / RADIUS, 1);
      
      if (distRatio < 0.1) {
        tempCol.copy(c2).lerp(new THREE.Color(0xffffff), 1 - (distRatio * 10));
      } else {
        tempCol.copy(c1).lerp(c3, Math.random() < 0.5 ? distRatio : 1 - distRatio);
      }
      
      // Give trailing edges of arms a different mix 
      if (spread > 0) {
        tempCol.lerp(c2, 0.4);
      }

      colors[i * 3] = tempCol.r;
      colors[i * 3 + 1] = tempCol.g;
      colors[i * 3 + 2] = tempCol.b;

      // 5. Size and Phase
      sizes[i] = (Math.random() * 0.2 + 0.05) * (1 - distRatio * 0.5);
      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    
    // Rotate the entire galaxy slowly
    ref.current.rotation.y = t * 0.1;
    // Add a gentle wobble to the disc
    ref.current.rotation.z = Math.sin(t * 0.2) * 0.1;
    ref.current.rotation.x = 0.2 + Math.cos(t * 0.15) * 0.05;

    // Optional: make stars twinkle in material (needs custom shader to do cheaply, skipping for simple implementation)
  });

  return (
    <points ref={ref} geometry={particles}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function GalaxyVortex() {
  return (
    <div className="galaxy-vortex-wrap" style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 10, 25], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <SwirlingGalaxy />
      </Canvas>
    </div>
  );
}
