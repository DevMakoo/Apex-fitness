"use client";

import dynamic from "next/dynamic";

const CanvasShell = dynamic(
  () => import("@/three/shared/canvas-shell").then((mod) => mod.CanvasShell),
  { ssr: false }
);
const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), { ssr: false });

export function HeroCanvas({ triggerSelector }: { triggerSelector: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <CanvasShell>
        <HeroScene triggerSelector={triggerSelector} />
      </CanvasShell>
    </div>
  );
}
