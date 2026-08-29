"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

type CanvasShellProps = {
  children: ReactNode;
  frameloop?: "always" | "demand" | "never";
};

export function CanvasShell({ children, frameloop = "always" }: CanvasShellProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 45, position: [0, 0, 6] }}
      frameloop={frameloop}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
