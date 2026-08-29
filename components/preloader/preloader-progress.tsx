"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { EASE, DURATION } from "@/lib/gsap/tokens";

export function PreloaderProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const counter = { value: 0 };
    gsap.to(counter, {
      value: 100,
      duration: DURATION.base,
      ease: EASE.standard,
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${Math.round(counter.value)}%`;
      },
    });
  }, []);

  return (
    <span
      data-preloader-progress
      ref={ref}
      className="absolute bottom-8 right-8 font-sans text-caption uppercase tracking-wide text-muted-foreground"
    >
      0%
    </span>
  );
}
