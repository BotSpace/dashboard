"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { usePathname, useRouter } from "@/shared/i18n/routing";
import { ONBOARDING_COOKIE } from "@/shared/lib/constants";
import { TOUR_STEPS } from "@/features/onboarding/steps";
import { Spotlight } from "@/features/onboarding/spotlight";

const DONE_KEY = "bs_onboarding_done";

type Phase = "closed" | "welcome" | "tour";

/** Reads the one-shot onboarding cookie and clears it (best-effort). */
function consumeCookie(): boolean {
  if (typeof document === "undefined") return false;
  const has = document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${ONBOARDING_COOKIE}=`));
  if (has) {
    document.cookie = `${ONBOARDING_COOKIE}=; Max-Age=0; path=/`;
  }
  return has;
}

function findTarget(target?: string): HTMLElement | null {
  if (!target || typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
}

export function OnboardingClient({ firstName }: { firstName?: string }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("closed");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Trigger once on first-ever sign-in (cookie seeded by the login route),
  // unless a previous run already completed it (localStorage).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DONE_KEY) === "1") return;
    if (consumeCookie()) {
      // Mark done up-front: the seed cookie carries the session domain and may
      // not be clearable from JS, so localStorage is the authoritative one-shot
      // gate. Guarantees the tour shows exactly once per registration.
      localStorage.setItem(DONE_KEY, "1");
      setPhase("welcome");
    }
  }, []);

  const finish = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem(DONE_KEY, "1");
    setPhase("closed");
    setStepIndex(0);
    setRect(null);
  }, []);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setPhase("tour");
  }, []);

  // Measure (and keep re-measuring) the current step's target. Handles the
  // navigate-then-appear case by polling until the element mounts.
  useEffect(() => {
    if (phase !== "tour") return;
    const step = TOUR_STEPS[stepIndex];

    // Navigate first if this step lives on another page.
    if (step.navigateTo && pathname !== step.navigateTo) {
      const href = step.prefillAgent
        ? `${step.navigateTo}?prompt=${encodeURIComponent(t("example"))}`
        : step.navigateTo;
      router.push(href);
      // The effect re-runs after pathname changes; measuring happens then.
      return;
    }

    let raf = 0;
    let attempts = 0;
    const maxAttempts = step.navigateTo ? 100 : 40; // longer window after nav

    const measure = () => {
      const el = findTarget(step.target);
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return true;
      }
      return false;
    };

    const tick = () => {
      attempts += 1;
      if (measure() || attempts >= maxAttempts) {
        if (attempts >= maxAttempts && !findTarget(step.target)) setRect(null);
        return;
      }
      raf = window.setTimeout(tick, 50);
    };
    tick();

    const onReflow = () => {
      const el = findTarget(step.target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.clearTimeout(raf);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [phase, stepIndex, pathname, router, t]);

  const next = useCallback(() => {
    setRect(null);
    setStepIndex((i) => {
      if (i >= TOUR_STEPS.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [finish]);

  const prev = useCallback(() => {
    setRect(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  if (phase === "closed") return null;

  const greeting = firstName ? t("welcome.hello", { name: firstName }) : t("welcome.title");

  return (
    <>
      <AnimatePresence>
        {phase === "welcome" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] grid place-items-center bg-[rgba(2,6,23,0.6)] p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-300/30 bg-card/95 p-7 text-center shadow-[0_30px_90px_rgba(8,47,73,0.4)] backdrop-blur-xl dark:border-cyan-300/20"
            >
              <span className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[conic-gradient(from_120deg,rgba(34,211,238,0.25),rgba(132,204,22,0.2),rgba(34,211,238,0.0))] blur-2xl" />
              <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/50 bg-gradient-to-br from-cyan-200 via-white to-lime-100 shadow-inner dark:border-white/15 dark:from-cyan-300/30 dark:via-slate-900 dark:to-lime-300/20">
                <Wand2 className="h-7 w-7 text-cyan-600 dark:text-cyan-300" />
              </div>
              <h2 className="relative text-xl font-bold text-foreground">{greeting}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("welcome.body")}
              </p>
              <div className="relative mt-6 flex flex-col gap-2">
                <button
                  onClick={startTour}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("welcome.start")}
                </button>
                <button
                  onClick={finish}
                  className="rounded-xl px-5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {t("welcome.skip")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "tour" && (
        <Spotlight
          rect={rect}
          placement={TOUR_STEPS[stepIndex].placement ?? "bottom"}
          pad={TOUR_STEPS[stepIndex].pad ?? 8}
          title={t(`steps.${TOUR_STEPS[stepIndex].key}.title`)}
          body={t(`steps.${TOUR_STEPS[stepIndex].key}.body`)}
          index={stepIndex}
          total={TOUR_STEPS.length}
          isLast={stepIndex === TOUR_STEPS.length - 1}
          nextLabel={t("next")}
          backLabel={t("back")}
          skipLabel={t("skip")}
          doneLabel={t("done")}
          onNext={next}
          onPrev={prev}
          onSkip={finish}
        />
      )}
    </>
  );
}
