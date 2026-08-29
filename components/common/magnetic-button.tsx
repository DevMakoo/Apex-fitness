"use client";

import { useRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type MagneticButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function MagneticButton({ children, ...anchorProps }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const node = ref.current;
      if (!node || reducedMotion) return;

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = node.getBoundingClientRect();
        const relativeX = event.clientX - (bounds.left + bounds.width / 2);
        const relativeY = event.clientY - (bounds.top + bounds.height / 2);
        gsap.to(node, {
          x: relativeX * 0.3,
          y: relativeY * 0.3,
          duration: DURATION.fast,
          ease: EASE.standard,
        });
      };

      const handlePointerLeave = () => {
        gsap.to(node, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      };

      node.addEventListener("pointermove", handlePointerMove);
      node.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        node.removeEventListener("pointermove", handlePointerMove);
        node.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <a ref={ref} {...anchorProps}>
      {children}
    </a>
  );
}
