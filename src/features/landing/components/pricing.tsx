"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function Pricing() {
  const t = useTranslations("landing.pricing");
  const source = ["free", "pro", "max"] as const;
  const prices = ["$0", "$10", "$20"];
  const tokens = ["200K", "1M", "2M"];
  const plans = source.map((key, index) => {
    const plan = t.raw(`plans.${key}`) as { name: string; tagBots: string; features: string[] };
    return { ...plan, price: prices[index], tokens: tokens[index], highlighted: key === "pro" };
  });

  return (
    <section id="pricing" className="border-b border-white/10 bg-black py-24 md:py-32">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm text-white/45">{t("eyebrow")}</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{t("title")}</h2>
          <p className="mt-4 text-base text-white/45">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-xl border border-white/15 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={`relative flex min-h-[520px] flex-col p-7 md:p-8 ${index < 2 ? "border-b border-white/10 lg:border-b-0 lg:border-r" : ""} ${plan.highlighted ? "bg-white/[0.04]" : "bg-black"}`}
            >
              {plan.highlighted ? <div className="absolute inset-x-0 top-0 h-px bg-white" /> : null}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                {plan.highlighted ? <span className="rounded-full border border-white/15 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-black">{t("popular")}</span> : null}
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-[-0.05em] text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-white/35">{t("perMonth")}</span>
              </div>
              <div className="mt-5 flex gap-2 text-xs text-white/45">
                <span className="rounded-md border border-white/10 px-2 py-1">{plan.tokens} {t("perTokens")}</span>
                <span className="rounded-md border border-white/10 px-2 py-1">{plan.tagBots}</span>
              </div>
              <Link href="/login" className={`mt-7 flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${plan.highlighted ? "bg-white text-black hover:bg-white/85" : "border border-white/15 text-white hover:bg-white/5"}`}>
                {t("cta")} <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="my-7 h-px bg-white/10" />
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-white/55"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-white" /> {feature}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
