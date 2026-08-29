"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const CanvasShell = dynamic(
  () => import("@/three/shared/canvas-shell").then((mod) => mod.CanvasShell),
  { ssr: false }
);
const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), { ssr: false });

export function HeroCanvas({ triggerSelector }: { triggerSelector: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <CanvasShell frameloop={inView ? "always" : "never"}>
        <HeroScene triggerSelector={triggerSelector} />
      </CanvasShell>
    </div>
  );
}
