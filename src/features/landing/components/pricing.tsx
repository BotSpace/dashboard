"use client";
import { Check, Zap, Sparkles, Crown, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";
import { SectionWrapper } from "./section-wrapper";

type Plan = {
  name: string;
  price: string;
  tokens: string;
  bots: string;
  features: string[];
  highlighted?: boolean;
  icon: typeof Zap;
  accent: string;
};

export function Pricing() {
  const t = useTranslations("landing.pricing");
  const free = t.raw("plans.free") as { name: string; tagBots: string; features: string[] };
  const pro = t.raw("plans.pro") as { name: string; tagBots: string; features: string[] };
  const max = t.raw("plans.max") as { name: string; tagBots: string; features: string[] };

  const plans: Plan[] = [
    {
      name: free.name,
      price: "$0",
      tokens: "200K",
      bots: free.tagBots,
      icon: Zap,
      accent: "#22d3ee",
      features: free.features,
    },
    {
      name: pro.name,
      price: "$10",
      tokens: "1M",
      bots: pro.tagBots,
      icon: Sparkles,
      accent: "#a78bfa",
      highlighted: true,
      features: pro.features,
    },
    {
      name: max.name,
      price: "$20",
      tokens: "2M",
      bots: max.tagBots,
      icon: Crown,
      accent: "#f0abfc",
      features: max.features,
    },
  ];

  return (
    <SectionWrapper id="pricing" className="relative isolate bg-deep py-28 md:py-36">
      <div className="spot-orb spot-violet left-1/2 top-[-100px] h-[420px] w-[820px] -translate-x-1/2 opacity-[0.30]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.30]" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
            <span className="h-1 w-1 rounded-full bg-violet-300" />
            {t("eyebrow")}
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="display mt-5 text-3xl font-semibold text-white md:text-4xl lg:text-[44px]"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-[15px] text-white/50 md:text-base"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:mt-16 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative ${p.highlighted ? "lg:-my-2" : ""}`}
            >
              {/* Animated conic ring for Pro */}
              {p.highlighted && <span className="conic-ring rounded-2xl" />}

              <div
                className="relative h-full overflow-hidden rounded-2xl p-7"
                style={{
                  background: p.highlighted
                    ? "linear-gradient(180deg, rgba(20,21,32,0.95) 0%, rgba(10,11,18,0.98) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)",
                  border: p.highlighted ? "none" : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: p.highlighted
                    ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -20px rgba(139,92,246,0.35), 0 14px 30px -10px rgba(0,0,0,0.5)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Inner glow for Pro */}
                {p.highlighted && (
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-30"
                    style={{ background: `radial-gradient(circle, ${p.accent}, transparent 70%)` }}
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        background: `linear-gradient(180deg, ${p.accent}1c 0%, ${p.accent}06 100%)`,
                        border: `1px solid ${p.accent}26`,
                        boxShadow: `inset 0 1px 0 ${p.accent}33`,
                      }}
                    >
                      <p.icon className="h-4 w-4" style={{ color: p.accent }} />
                    </div>
                    <div className="text-lg font-semibold text-white/90">{p.name}</div>
                  </div>
                  {p.highlighted && (
                    <div
                      className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white"
                      style={{
                        background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                        boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
                      }}
                    >
                      {t("popular")}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span
                    className="text-5xl font-bold tracking-tight"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {p.price}
                  </span>
                  <span className="text-sm text-white/35">{t("perMonth")}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2 py-1 text-[11px] font-medium"
                    style={{
                      background: `${p.accent}10`,
                      border: `1px solid ${p.accent}26`,
                      color: p.accent,
                    }}
                  >
                    {p.tokens} {t("perTokens")}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/55">
                    {p.bots}
                  </span>
                </div>

                <Link
                  href="/login"
                  className={`mt-7 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    p.highlighted ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {t("cta")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13px] text-white/55"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: p.accent }}
                        strokeWidth={2.5}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
