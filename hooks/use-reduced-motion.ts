"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Reading matchMedia during render would crash on the server (no `window`)
    // and reading it eagerly on the client would risk a hydration mismatch
    // against the server's default. Setting it post-mount is the correct,
    // SSR-safe way to surface this value, at the cost of one extra render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
