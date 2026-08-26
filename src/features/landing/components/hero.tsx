"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Check, Play, Plus, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

const flowNodes = [
  { id: "trigger", left: "8%", top: "22%" },
  { id: "msg", left: "37%", top: "12%" },
  { id: "ai", left: "67%", top: "31%" },
  { id: "save", left: "38%", top: "62%" },
  { id: "menu", left: "70%", top: "70%" },
] as const;

export function Hero() {
  const t = useTranslations("landing.hero");
  const tf = useTranslations("landing.flow");
  const features = useTranslations("landing.features");
  const flowBullets = tf.raw("bullets") as string[];

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black pt-16">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_62%)]" />

      <div className="container-page relative flex min-h-[720px] flex-col items-center px-4 pb-0 pt-24 text-center md:min-h-[820px] md:pt-32">
        <motion.a
          href="#features"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
            <Plus className="h-3 w-3" />
          </span>
          {t("badge")}
          <ArrowRight className="h-3 w-3" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6 }}
          className="mt-8 max-w-5xl text-balance text-[44px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[88px]"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.6 }}
          className="mt-7 max-w-2xl text-balance text-base leading-7 text-white/55 md:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/85">
            {t("ctaPrimary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#features" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-white/5">
            <Play className="h-3.5 w-3.5 fill-current" />
            {t("ctaSecondary")}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.7 }}
          className="relative mt-20 w-full max-w-6xl overflow-hidden rounded-t-xl border border-b-0 border-white/15 bg-[#0a0a0a] text-left shadow-[0_-20px_100px_rgba(255,255,255,0.06)]"
        >
          <div className="flex h-12 items-center border-b border-white/10 px-4">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs text-white/45">
              <Bot className="h-3.5 w-3.5" />
              {tf("eyebrow")}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {tf("live")}
            </div>
          </div>

          <div className="grid min-h-[340px] md:grid-cols-[190px_1fr_230px]">
            <aside className="hidden border-r border-white/10 p-3 md:block">
              <div className="px-2 pb-3 text-[10px] font-medium uppercase tracking-widest text-white/30">{features("eyebrow")}</div>
              {[0, 1, 4, 5].map((itemIndex, index) => (
                <div key={itemIndex} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-white/50">
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-white/10 text-[10px] text-white/40">{index + 1}</span>
                  {features(`items.${itemIndex}.title`)}
                </div>
              ))}
            </aside>

            <div className="relative min-h-[340px] overflow-hidden bg-[#070707]">

              <div className="landing-dot-grid absolute inset-0 opacity-70" />
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M100 105 C 220 105, 170 72, 300 72" fill="none" stroke="rgba(255,255,255,.22)" />
                <path d="M365 92 C 430 92, 420 145, 510 145" fill="none" stroke="rgba(255,255,255,.22)" />
                <path d="M350 105 C 350 205, 290 210, 300 250" fill="none" stroke="rgba(255,255,255,.14)" strokeDasharray="4 5" />
                <path d="M500 175 C 540 220, 515 255, 560 270" fill="none" stroke="rgba(255,255,255,.22)" />
              </svg>
              {flowNodes.map((node, index) => {
                const translatedNode = tf.raw(`nodes.${node.id}`) as { type: string; label: string };
                return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + index * 0.08 }}
                  className="absolute w-32 rounded-lg border border-white/15 bg-[#111] p-3 shadow-xl"
                  style={{ left: node.left, top: node.top }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span className="text-[10px] text-white/35">{translatedNode.type}</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-white/85">{translatedNode.label}</div>
                </motion.div>
                );
              })}
            </div>

            <aside className="hidden border-l border-white/10 p-4 lg:block">
              <div className="flex items-center gap-2 text-xs font-medium text-white/80"><Workflow className="h-4 w-4" /> {tf("eyebrow")}</div>
              <div className="mt-5 space-y-3">
                {flowBullets.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[11px] text-white/45">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> {item}
                  </div>
                ))}
              </div>
              <button className="mt-6 flex h-9 w-full items-center justify-center rounded-md bg-white text-xs font-medium text-black">{t("ctaPrimary")}</button>
            </aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
