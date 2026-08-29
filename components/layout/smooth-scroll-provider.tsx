"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LenisContext } from "@/hooks/use-lenis";

registerGsap();

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    // Lenis is a browser-only external instance that can't be constructed
    // during render (SSR has no `window`), so publishing it to context
    // necessarily happens post-mount — one intentional extra render here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenisInstance(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
