"use client";

import { ArrowUp, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function AIAgent() {
  const t = useTranslations("landing.agent");
  const tags = t.raw("tags") as string[];

  return (
    <section className="border-b border-white/10 bg-black py-24 md:py-32">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/45"><Sparkles className="h-4 w-4" /> {t("eyebrow")}</div>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{t("title")}</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/45">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/55">{tag}</span>)}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-xl border border-white/15 bg-[#080808]"
          >
            <div className="flex h-14 items-center border-b border-white/10 px-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white text-black"><Bot className="h-4 w-4" /></div>
              <div className="ml-3">
                <div className="text-xs font-medium text-white/85">{t("chat.headerTitle")}</div>
                <div className="text-[10px] text-white/35">{t("chat.headerStatus")}</div>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
            </div>

            <div className="space-y-5 p-5 md:p-7">
              <div className="ml-auto max-w-[85%] rounded-lg border border-white/10 bg-white px-4 py-3 text-sm leading-6 text-black">{t("chat.u1")}</div>
              <div className="max-w-[90%] rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white/70">
                <div>{t("chat.a1")}</div>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-xs text-white/55">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {t("chat.a1Flow")}
                </div>
              </div>
              <div className="ml-auto max-w-[85%] rounded-lg border border-white/10 bg-white px-4 py-3 text-sm text-black">{t("chat.u2")}</div>
              <div className="max-w-[90%] rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white/70">
                {t("chat.a2")} <span className="font-medium text-white">{t("chat.a2Mention")}</span> {t("chat.a2Tail")}
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex h-11 items-center rounded-md border border-white/15 bg-black px-4 text-sm text-white/30">
                {t("chat.placeholder")}
                <button className="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-white text-black"><ArrowUp className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
