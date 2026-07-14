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

// Below the `lg` breakpoint the sidebar collapses into a drawer, so its nav
// anchors live in a portal that's only mounted while the drawer is open.
const DRAWER_EVENT = "bs:tour-drawer";
const SIDEBAR_BREAKPOINT = 1024;

function isSmallScreen(): boolean {
  return typeof window !== "undefined" && window.innerWidth < SIDEBAR_BREAKPOINT;
}

function setDrawer(open: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DRAWER_EVENT, { detail: open }));
}

// Pick the first *visible* match: on small screens the desktop sidebar is
// display:none (zero-size rect) while the drawer copy is the real target.
function findTarget(target?: string): HTMLElement | null {
  if (!target || typeof document === "undefined") return null;
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`));
  return (
    els.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) ?? null
  );
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
    setDrawer(false);
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

    // On small screens, open the mobile drawer for sidebar steps (and close it
    // again for anything else) so the anchor is actually on screen.
    const needsDrawer = isSmallScreen() && !!step.target?.startsWith("nav-");
    setDrawer(needsDrawer);

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
            className="fixed inset-0 z-[200] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Wand2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{greeting}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("welcome.body")}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={startTour}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("welcome.start")}
                </button>
                <button
                  onClick={finish}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
