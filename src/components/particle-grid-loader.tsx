"use client";

import dynamic from "next/dynamic";

const ParticleGrid = dynamic(() => import("@/components/particle-grid"), {
  ssr: false,
  loading: () => <div className="particle-grid-wrap particle-grid-fallback" />,
});

export default function ParticleGridLoader() {
  return <ParticleGrid />;
}
