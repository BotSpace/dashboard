"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function FAQ() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-b border-white/10 bg-black py-24 md:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-[.65fr_1.35fr]">
        <div>
          <div className="text-sm text-white/45">{t("eyebrow")}</div>
          <h2 className="mt-4 max-w-sm text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{t("title")}</h2>
        </div>
        <div className="border-t border-white/15">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className="border-b border-white/15">
                <button type="button" onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={isOpen}>
                  <span className="text-base font-medium text-white/85">{item.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="flex h-7 w-7 shrink-0 items-center justify-center text-white/50"><Plus className="h-4 w-4" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="max-w-2xl pb-6 pr-12 text-sm leading-7 text-white/45">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
