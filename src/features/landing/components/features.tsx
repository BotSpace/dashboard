"use client";

import { motion } from "framer-motion";
import { BarChart3, Blocks, Bot, BrainCircuit, Database, Globe, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Blocks, BrainCircuit, ShoppingBag, Globe, Database, BarChart3];

export function Features() {
  const t = useTranslations("landing.features");
  const items = Array.from({ length: 6 }, (_, index) => ({
    title: t(`items.${index}.title`),
    desc: t(`items.${index}.desc`),
    Icon: icons[index],
  }));

  return (
    <section id="features" className="border-b border-white/10 bg-black py-24 md:py-32">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-sm font-medium text-white/45">{t("eyebrow")}</div>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{t("title")}</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/45 lg:justify-self-end">{t("subtitle")}</p>
        </div>

        <div className="mt-0 grid overflow-hidden border-x border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, desc, Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="group relative min-h-64 border-b border-white/10 p-7 transition-colors hover:bg-white/[0.035] lg:p-8 [&:not(:nth-child(3n))]:lg:border-r sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/[0.03]">
                  <Icon className="h-4.5 w-4.5 text-white/75" />
                </div>
                <span className="font-mono text-[11px] text-white/20">0{index + 1}</span>
              </div>
              <h3 className="mt-12 text-lg font-medium tracking-tight text-white">{title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">{desc}</p>
              <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>

        <div className="grid border-x border-b border-white/10 md:grid-cols-[1.3fr_.7fr]">
          <div className="relative min-h-72 overflow-hidden border-b border-white/10 p-8 md:border-b-0 md:border-r">
            <div className="landing-dot-grid absolute inset-0 opacity-60" />
            <div className="relative max-w-md">
              <Bot className="h-6 w-6 text-white/80" />
              <div className="mt-6 text-2xl font-medium tracking-tight text-white">{t("title")}</div>
              <p className="mt-3 text-sm leading-6 text-white/45">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex min-h-72 items-center justify-center bg-[#050505] p-8">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute inset-0 rotate-45 border border-white/15" />
              <div className="absolute inset-6 rotate-45 border border-white/25" />
              <Bot className="relative h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
