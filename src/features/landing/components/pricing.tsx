"use client";
import { Check, Zap, Sparkles, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";
import { SectionWrapper } from "./section-wrapper";

const BG = "#030308";

type Plan = {
  name: string;
  price: string;
  tokens: string;
  bots: string;
  features: string[];
  highlighted?: boolean;
  icon: typeof Zap;
  color: string;
};

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0",
      tokens: "200K token",
      bots: "1 bot",
      icon: Zap,
      color: "#00e5ff",
      features: ["Vizual konstruktor", "AI agent (limitli)", "Marketplace", "Community support"],
    },
    {
      name: "Pro",
      price: "$10",
      tokens: "1M token",
      bots: "10 bot",
      icon: Sparkles,
      color: "#8b5cf6",
      highlighted: true,
      features: ["Barcha Free imkoniyatlar", "Kengaytirilgan AI", "Priority support", "Custom domain", "Analitika"],
    },
    {
      name: "Max",
      price: "$20",
      tokens: "2M token",
      bots: "Cheksiz",
      icon: Crown,
      color: "#06b6d4",
      features: ["Barcha Pro imkoniyatlar", "Cheksiz botlar", "Maxsus integratsiyalar", "SLA 99.9%", "Shaxsiy menejer", "API access"],
    },
  ];

  return (
    <SectionWrapper id="pricing" className="relative py-24 md:py-36" style={{ background: BG }}>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.035]"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 25%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-base text-white/30 md:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Animated border for Pro */}
              {p.highlighted && (
                <div
                  className="absolute -inset-[1px] overflow-hidden rounded-2xl"
                  style={{ padding: "1px" }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "conic-gradient(from 0deg, #00e5ff, #8b5cf6, #06b6d4, #8b5cf6, #00e5ff)",
                      animation: "lp-orb-rotate 4s linear infinite",
                      opacity: 0.5,
                    }}
                  />
                </div>
              )}

              <div
                className="relative h-full rounded-2xl p-7"
                style={{
                  background: p.highlighted ? "rgba(3,3,8,0.95)" : "rgba(255,255,255,0.015)",
                  border: p.highlighted ? "none" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {p.highlighted && (
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
                  />
                )}

                {p.highlighted && (
                  <div
                    className="mb-4 inline-flex rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      background: "linear-gradient(135deg, #00c8ff, #8b5cf6)",
                      color: "#fff",
                    }}
                  >
                    {t("popular")}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${p.color}0a`, border: `1px solid ${p.color}18` }}
                  >
                    <p.icon className="h-4 w-4" style={{ color: p.color }} />
                  </div>
                  <div className="text-lg font-semibold text-white/85">{p.name}</div>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{p.price}</span>
                  <span className="text-sm text-white/25">{t("perMonth")}</span>
                </div>

                <div className="mt-3 flex items-center gap-2.5 text-[11px] text-white/35">
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{ background: `${p.color}08`, border: `1px solid ${p.color}12` }}
                  >
                    {p.tokens}/oy
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {p.bots}
                  </span>
                </div>

                <Link
                  href="/login"
                  className="mt-6 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={
                    p.highlighted
                      ? {
                          background: "linear-gradient(135deg, #00c8ff, #8b5cf6)",
                          color: "#fff",
                          boxShadow: "0 0 30px rgba(139,92,246,0.2)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          color: "rgba(255,255,255,0.6)",
                        }
                  }
                >
                  {t("cta")}
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/35">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: p.color }} />
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
