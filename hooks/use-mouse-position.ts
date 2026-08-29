"use client";

import { useEffect, useRef } from "react";

export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      position.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      position.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return position;
}
