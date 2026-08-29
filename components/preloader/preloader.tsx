"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLenis } from "@/hooks/use-lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PreloaderProgress } from "./preloader-progress";

const PreloaderContext = createContext(false);

export function usePreloaderComplete(): boolean {
  return useContext(PreloaderContext);
}

export function Preloader({ children }: { children: ReactNode }) {
  const [complete, setComplete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      if (reducedMotion) {
        // Reduced motion skips the whole sequence immediately.
        setComplete(true);
        lenis?.start();
        return;
      }

      const minimumDisplay = new Promise<void>((resolve) => setTimeout(resolve, 800));
      const fontsReady =
        typeof document !== "undefined" && "fonts" in document
          ? document.fonts.ready
          : Promise.resolve();

      Promise.all([minimumDisplay, fontsReady]).then(() => {
        gsap
          .timeline({
            onComplete: () => {
              setComplete(true);
              lenis?.start();
            },
          })
          .to("[data-preloader-word]", { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.out" })
          .to("[data-preloader-progress]", { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.2")
          .to(overlayRef.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" })
          .set(overlayRef.current, { display: "none" });
      });
    },
    { scope: overlayRef, dependencies: [reducedMotion, lenis] }
  );

  return (
    <PreloaderContext.Provider value={complete}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        aria-hidden="true"
      >
        <span
          data-preloader-word
          className="font-display text-display uppercase tracking-wide text-foreground"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        >
          APEX
        </span>
        <PreloaderProgress />
      </div>
      <div inert={complete ? undefined : true}>{children}</div>
    </PreloaderContext.Provider>
  );
}
