"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TourPlacement } from "@/features/onboarding/steps";

const CARD_WIDTH = 320;
const GAP = 14;
const MARGIN = 12;

type SpotlightProps = {
  /** Target bounding box in viewport coords, or null for a centered card. */
  rect: DOMRect | null;
  placement: TourPlacement;
  pad: number;
  title: string;
  body: string;
  index: number;
  total: number;
  isLast: boolean;
  nextLabel: string;
  backLabel: string;
  skipLabel: string;
  doneLabel: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
};

function cardPosition(rect: DOMRect | null, placement: TourPlacement) {
  if (typeof window === "undefined" || !rect) {
    return { centered: true, top: 0, left: 0 };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = rect.top;
  let left = rect.left;

  switch (placement) {
    case "right":
      left = rect.right + GAP;
      top = rect.top;
      break;
    case "left":
      left = rect.left - CARD_WIDTH - GAP;
      top = rect.top;
      break;
    case "bottom":
      top = rect.bottom + GAP;
      left = rect.left;
      break;
    case "top":
    default:
      top = rect.top - GAP; // card sits above; translateY(-100%) applied via style
      left = rect.left;
      break;
  }

  // Clamp horizontally so the card never leaves the viewport.
  left = Math.min(Math.max(left, MARGIN), vw - CARD_WIDTH - MARGIN);
  // For non-top placements clamp top too (top placement uses translateY).
  if (placement !== "top") {
    top = Math.min(Math.max(top, MARGIN), vh - MARGIN - 160);
  } else {
    top = Math.max(top, MARGIN + 160);
  }
  return { centered: false, top, left, translateUp: placement === "top" };
}

export function Spotlight(props: SpotlightProps) {
  const { rect, placement, pad } = props;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const pos = cardPosition(rect, placement);
  const cut = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  const card = (
    // Positioning lives on this OUTER element and animates opacity only, so
    // framer never writes to `transform` and our translateY(-100%) survives.
    // The inner element owns the entrance transform (scale/slide).
    <motion.div
      key={props.index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={
        pos.centered
          ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
          : {
              left: pos.left,
              top: pos.top,
              transform: pos.translateUp ? "translateY(-100%)" : undefined,
            }
      }
      className="pointer-events-auto fixed z-[201] w-[320px] max-w-[calc(100vw-24px)]"
    >
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card p-4 shadow-xl"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {props.index + 1} / {props.total}
        </span>
        <button
          onClick={props.onSkip}
          aria-label={props.skipLabel}
          className="-mr-1 ml-auto rounded-md p-1 text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{props.title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{props.body}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {Array.from({ length: props.total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === props.index ? "w-4 bg-blue-600 dark:bg-blue-500" : "w-1.5 bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {props.index > 0 && (
            <button
              onClick={props.onPrev}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {props.backLabel}
            </button>
          )}
          <button
            onClick={props.onNext}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            {props.isLast ? props.doneLabel : props.nextLabel}
            {!props.isLast && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
    </motion.div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      {/* Dimmed backdrop. With a target we punch a spotlight hole using a
          box-shadow ring; without one the whole backdrop dims. Clicks on the
          backdrop are swallowed (pointer-events) so the tour stays in control. */}
      {cut ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto absolute rounded-lg ring-2 ring-blue-500/70"
          style={{
            top: cut.top,
            left: cut.left,
            width: cut.width,
            height: cut.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
          }}
        />
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-black/55" />
      )}
      <AnimatePresence mode="wait">{card}</AnimatePresence>
    </div>,
    document.body
  );
}
