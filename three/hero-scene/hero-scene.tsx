"use client";

import { useHeroScrollRig } from "./use-hero-scroll-rig";
import { HeroMesh } from "./hero-mesh";

export function HeroScene({ triggerSelector }: { triggerSelector: string }) {
  const groupRef = useHeroScrollRig(triggerSelector);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 4]} intensity={1.4} />
      <group ref={groupRef}>
        <HeroMesh />
      </group>
    </>
  );
}
