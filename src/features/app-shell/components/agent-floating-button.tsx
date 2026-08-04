"use client";

import { Bot, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function AgentFloatingButton() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (pathname.includes("/app/agent")) {
    return null;
  }

  return (
    <Link
      href="/app/agent"
      data-tour="agent-fab"
      aria-label={t("agentFabAria")}
      className="group fixed bottom-5 right-4 z-40 isolate flex h-14 w-14 items-center justify-center p-0 transition duration-200 hover:-translate-y-1 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-3 sm:rounded-full sm:border sm:border-blue-300/30 sm:bg-background/90 sm:px-2 sm:py-2 sm:pr-4 sm:shadow-[0_12px_35px_rgba(37,99,235,0.28)] sm:backdrop-blur-xl sm:hover:border-blue-300/60 sm:hover:shadow-[0_18px_45px_rgba(79,70,229,0.38)] sm:dark:border-white/15 sm:dark:bg-slate-950/90"
    >
      <span className="pointer-events-none absolute h-11 w-11 -z-10 rounded-xl bg-linear-to-br from-blue-500/40 via-indigo-500/30 to-violet-500/40 opacity-60 blur-md transition-opacity group-hover:opacity-90 sm:absolute sm:-inset-1 sm:h-auto sm:w-auto sm:rounded-full" />
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/25 bg-linear-to-br from-blue-500 via-indigo-500 to-violet-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(37,99,235,0.35)] motion-safe:animate-[agent-float_2.7s_ease-in-out_infinite] sm:rounded-full">
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_38%)]" />
        <Bot className="relative h-6 w-6 drop-shadow-sm transition-transform duration-200 group-hover:scale-110" strokeWidth={2.2} />
        <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full border border-white/40 bg-white text-indigo-600 shadow-sm">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
        </span>
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white/80 bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.9)]" />
      </span>
      <span className="relative hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="text-xs font-semibold text-foreground">{t("agentFab")}</span>
        <span className="text-[11px] text-muted-foreground">{t("agentFabDesc")}</span>
      </span>
    </Link>
  );
}
