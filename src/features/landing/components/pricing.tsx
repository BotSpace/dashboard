"use client";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
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
  color: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
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
      color: "#0ea5e9",
      features: [
        "Vizual konstruktor",
        "AI agent (limitli)",
        "Marketplace shablonlar",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "$10",
      tokens: "1M token",
      bots: "10 bot",
      icon: Sparkles,
      color: "#7c3aed",
      highlighted: true,
      features: [
        "Barcha Free imkoniyatlar",
        "Kengaytirilgan AI agent",
        "Priority support",
        "Custom domain",
        "Analitika dashboard",
      ],
    },
    {
      name: "Max",
      price: "$20",
      tokens: "2M token",
      bots: "Cheksiz",
      icon: Crown,
      color: "#06b6d4",
      features: [
        "Barcha Pro imkoniyatlar",
        "Cheksiz botlar",
        "Maxsus integratsiyalar",
        "SLA 99.9%",
        "Shaxsiy menejer",
        "API access",
      ],
    },
  ];

  return (
    <SectionWrapper
      id="pricing"
      className="relative py-24 md:py-32"
      style={{ background: "#06060a" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 30%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/35 md:text-lg">{t("subtitle")}</p>
        </div>

        <motion.div
          className="mt-16 grid gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden rounded-2xl p-[1px]"
              style={{
                background: p.highlighted
                  ? undefined
                  : "rgba(255,255,255,0.06)",
              }}
            >
              {/* Highlighted: animated conic-gradient border */}
              {p.highlighted && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "conic-gradient(from var(--angle, 0deg), #0ea5e9, #7c3aed, #06b6d4, #0ea5e9)",
                    animation: "pricing-spin 3s linear infinite",
                  }}
                />
              )}

              <div
                className="relative h-full rounded-[15px] p-7"
                style={{
                  background: p.highlighted
                    ? "rgba(6,6,10,0.93)"
                    : "rgba(6,6,10,0.98)",
                  boxShadow: p.highlighted
                    ? "0 0 40px rgba(124,58,237,0.12), 0 20px 60px rgba(0,0,0,0.4)"
                    : undefined,
                }}
              >
                {p.highlighted && (
                  <div
                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
                    style={{
                      background: `radial-gradient(circle, ${p.color}, transparent 70%)`,
                    }}
                  />
                )}
                {p.highlighted && (
                  <div
                    className="mb-4 inline-flex rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                      color: "#fff",
                    }}
                  >
                    {t("popular")}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: `${p.color}12`,
                      border: `1px solid ${p.color}25`,
                    }}
                  >
                    <p.icon className="h-4 w-4" style={{ color: p.color }} />
                  </div>
                  <div className="text-lg font-semibold text-white/90">{p.name}</div>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    {p.price}
                  </span>
                  <span className="text-sm text-white/30">{t("perMonth")}</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{
                      background: `${p.color}10`,
                      border: `1px solid ${p.color}15`,
                    }}
                  >
                    {p.tokens}/oy
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
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
                          background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                          color: "#fff",
                          boxShadow: "0 0 20px rgba(124,58,237,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.7)",
                        }
                  }
                >
                  {t("cta")}
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/40">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: p.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @keyframes pricing-spin {
          0%   { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
      `}</style>
    </SectionWrapper>
  );
}
