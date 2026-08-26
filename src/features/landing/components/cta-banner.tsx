"use client";

import { ArrowRight, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function CtaBanner() {
  const t = useTranslations("landing.cta");

  return (
    <section id="contact" className="bg-black py-24 md:py-32">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-xl border border-white/15 px-6 py-20 text-center md:py-28">
          <div className="landing-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/15 bg-white text-black"><Bot className="h-6 w-6" /></div>
          <h2 className="relative mx-auto mt-7 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">{t("title")}</h2>
          <p className="relative mt-5 text-base text-white/45">{t("subtitle")}</p>
          <Link href="/login" className="relative mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-white/85">
            {t("button")} <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="relative mt-5 text-xs text-white/35">{t("trust")}</div>
        </motion.div>
      </div>
    </section>
  );
}
