"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 45, position: [0, 0, 6] }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
