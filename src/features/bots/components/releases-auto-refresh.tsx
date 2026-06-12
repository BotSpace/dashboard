"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Statuses that are transient and resolve on their own within seconds (the
// k8s-watcher flips them to running/failed). We poll while any release is in
// one of these. Deliberately excludes "stopping" — old releases can linger
// there, and we must not poll forever.
const TRANSIENT = new Set(["init", "initializing", "pending"]);

const INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40; // ~2 min ceiling

/**
 * Invisible helper for the releases table (a Server Component): while any
 * release is still spinning up, periodically re-render the page so the freshly
 * fetched status replaces the stale "init" without the user refreshing.
 */
export function ReleasesAutoRefresh({ statuses }: { statuses: string[] }) {
  const router = useRouter();
  const attempts = useRef(0);

  const shouldPoll = statuses.some((s) => TRANSIENT.has(s));

  useEffect(() => {
    if (!shouldPoll) {
      attempts.current = 0;
      return;
    }
    const t = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > MAX_ATTEMPTS) {
        clearInterval(t);
        return;
      }
      router.refresh();
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [shouldPoll, router]);

  return null;
}
