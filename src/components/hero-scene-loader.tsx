"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="hero-scene-container hero-scene-fallback" />
  ),
});

export default function HeroSceneLoader() {
  return <HeroScene />;
}
