"use client";

import dynamic from "next/dynamic";

const GalaxyVortex = dynamic(() => import("./galaxy-vortex"), {
  ssr: false,
});

export function GalaxyVortexLoader() {
  return <GalaxyVortex />;
}
