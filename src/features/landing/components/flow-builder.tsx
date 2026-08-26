"use client";

import { Check, CircleDot, Rocket, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function FlowBuilder() {
  const t = useTranslations("landing.flow");
  const bullets = t.raw("bullets") as string[];
  const nodes = ["trigger", "msg", "menu", "cond", "ai", "save"] as const;

  return (
    <section className="border-b border-white/10 bg-black py-24 md:py-32">
      <div className="container-page grid overflow-hidden border border-white/10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center border-b border-white/10 p-8 md:p-12 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-sm text-white/45"><Workflow className="h-4 w-4" /> {t("eyebrow")}</div>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{t("title")}</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/45">{t("subtitle")}</p>
          <ul className="mt-8 space-y-3">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/65"><Check className="h-4 w-4 text-white" /> {item}</li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[480px] overflow-hidden bg-[#070707] p-6 md:p-10">
          <div className="landing-dot-grid absolute inset-0 opacity-75" />
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4 text-xs text-white/40">
            <span>{t("eyebrow")}</span>
            <span className="flex items-center gap-2"><CircleDot className="h-3.5 w-3.5 text-emerald-400" /> {t("live")}</span>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-x-12 gap-y-7 md:grid-cols-3">
            {nodes.map((id, index) => {
              const node = t.raw(`nodes.${id}`) as { type: string; label: string };
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="relative z-10 rounded-lg border border-white/15 bg-[#111] p-4 shadow-2xl"
                >
                  <div className="text-[10px] uppercase tracking-wider text-white/30">{node.type}</div>
                  <div className="mt-2 text-sm font-medium text-white/85">{node.label}</div>
                  <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-white/40 bg-black" />
                </motion.div>
              );
            })}
          </div>
          <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-md border border-white/15 bg-black px-3 py-2 text-xs text-white/65">
            <Rocket className="h-3.5 w-3.5" /> {t("live")}
          </div>
        </div>
      </div>
    </section>
  );
}
