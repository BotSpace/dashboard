"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionWrapper } from "./section-wrapper";

export function FAQ() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <SectionWrapper className="relative isolate bg-deep py-28 md:py-36">
      <div className="spot-orb spot-cyan left-1/2 top-[20%] h-[360px] w-[700px] -translate-x-1/2 opacity-[0.18]" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
            <span className="h-1 w-1 rounded-full bg-cyan-300" />
            {t("eyebrow")}
          </div>
          <h2 className="display mt-5 text-3xl font-semibold text-white md:text-4xl lg:text-[44px]">
            {t("title")}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.005) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {items.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-white/[0.018]"
                  aria-expanded={isOpen}
                >
                  <span className={`text-[15px] font-medium transition-colors ${isOpen ? "text-white" : "text-white/80 group-hover:text-white/95"}`}>
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
                        opacity: { duration: 0.25, delay: isOpen ? 0.08 : 0 },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="px-6 pb-5 pr-12 text-[14px] leading-relaxed text-white/55">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
