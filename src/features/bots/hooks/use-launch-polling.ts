"use client";

import { useEffect, useRef, useState } from "react";
import { getBotLaunchStatusAction } from "@/features/bots/actions";
import { analytics } from "@/shared/analytics/umami";
import type { Project } from "@/shared/types/api";

// Shared by the template-create wizard and the blank-bot wizard's final
// "Ishga tushirish" step. "no_connect" is an extra terminal state (not
// produced by getBotLaunchStatusAction itself) a caller can set directly —
// e.g. when the blank-bot wizard already knows, right after creating the
// project, that there's no token/managed-bot connected yet, so polling would
// just spin until timeout for nothing.
export type LaunchStatus = "starting" | "running" | "failed" | "timeout" | "no_connect";

export type LaunchProject = Pick<
  Project,
  "id" | "uuid" | "name" | "bot_mode" | "bot_username" | "bot_link"
>;

/**
 * @param meta Analitika uchun kontekst (`source`, `mode`) — yakuniy holat
 *   `bot-launch-result` eventiga qo'shiladi. "Bot yaratildi" ≠ "bot ishlayapti":
 *   failed/timeout jimgina yuz beradi, aynan shu yerda yo'qotamiz.
 */
export function useLaunchPolling(
  pollTargetId: string | number | null,
  meta?: Record<string, unknown>,
) {
  const [launchState, setLaunchState] = useState<LaunchStatus>("starting");
  const [launchProject, setLaunchProject] = useState<LaunchProject | null>(null);

  // Ref orqali: meta har renderda yangi obyekt bo'ladi, uni effect dep'iga
  // qo'ysak polling qayta ishga tushib ketardi.
  const metaRef = useRef(meta);
  metaRef.current = meta;

  // Bot ishga tushishini poll qilish — releases/page.tsx bilan bir xil
  // endpoint (ReleasesAPI.list) dan foydalanadigan getBotLaunchStatusAction
  // orqali. ~3s oraliq, ~2 daqiqagacha (40 urinish), running/failed'da to'xtaydi.
  useEffect(() => {
    if (pollTargetId == null) return;
    let stopped = false;
    let attempts = 0;
    const timer = setInterval(async () => {
      if (stopped) return;
      attempts += 1;
      const res = await getBotLaunchStatusAction(pollTargetId);
      if (stopped) return;
      if (res.ok) {
        if (res.project) {
          setLaunchProject((prev) => (prev ? { ...prev, ...res.project } : (res.project ?? prev)));
        }
        if (res.status === "running") {
          setLaunchState("running");
          analytics.botLaunchResult({ state: "running", ...metaRef.current });
          stopped = true;
          clearInterval(timer);
          return;
        }
        if (res.status === "failed") {
          setLaunchState("failed");
          analytics.botLaunchResult({ state: "failed", ...metaRef.current });
          stopped = true;
          clearInterval(timer);
          return;
        }
      }
      if (attempts >= 40) {
        setLaunchState("timeout");
        analytics.botLaunchResult({ state: "timeout", ...metaRef.current });
        stopped = true;
        clearInterval(timer);
      }
    }, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [pollTargetId]);

  return { launchState, setLaunchState, launchProject, setLaunchProject };
}
