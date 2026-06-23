"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe hook: returns true only when mounted on a desktop viewport (≥1024px).
 * Server-render and first paint always return false — no hydration mismatch.
 * Listens for resize/orientation changes so the value stays correct.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    // Set initial value after mount
    setIsDesktop(mq.matches);

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
