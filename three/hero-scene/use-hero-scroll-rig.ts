"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group } from "three";
import { lerp } from "@/three/shared/pointer-parallax";
import { useMousePosition } from "@/hooks/use-mouse-position";

export function useHeroScrollRig(triggerSelector: string) {
  const groupRef = useRef<Group>(null);
  const scrollProgress = useRef(0);
  const pointer = useMousePosition();

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      trigger: triggerSelector,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [triggerSelector]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y = lerp(group.rotation.y, pointer.current.x * 0.4, 0.05);
    group.rotation.x = lerp(group.rotation.x, -pointer.current.y * 0.2, 0.05);
    group.position.y = lerp(group.position.y, -scrollProgress.current * 1.5, 0.08);
  });

  return groupRef;
}
