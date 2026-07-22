"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BOARD_EVENTS = [
  "kanban_board_created",
  "kanban_board_updated",
  "kanban_board_archived",
  "kanban_board_restored",
  "kanban_board_linked",
  "kanban_board_unlinked",
] as const;

/** Keeps active/archive Board lists synchronized in other browser tabs. */
export function BoardRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;
    const refresh = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => router.refresh(), 100);
    };
    const source = new EventSource("/api/boards/events");
    BOARD_EVENTS.forEach((event) => source.addEventListener(event, refresh));
    window.addEventListener("focus", refresh);

    return () => {
      if (timer) window.clearTimeout(timer);
      BOARD_EVENTS.forEach((event) =>
        source.removeEventListener(event, refresh),
      );
      window.removeEventListener("focus", refresh);
      source.close();
    };
  }, [router]);

  return null;
}
