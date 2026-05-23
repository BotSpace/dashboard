"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative min-h-[100vh] overflow-hidden" style={{ background: "#06060a" }}>
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)",
            animation: "lp-pulse-glow 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)",
            animation: "lp-pulse-glow 8s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute right-[15%] top-[20%] h-[350px] w-[350px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)",
            animation: "lp-pulse-glow 7s ease-in-out infinite 4s",
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Particle dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#7c3aed" : "#06b6d4",
              opacity: 0.3 + Math.random() * 0.4,
              animation: `lp-drift ${6 + Math.random() * 8}s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Central orb */}
      <div className="pointer-events-none absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px]">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(14,165,233,0.15)",
              animation: "lp-orb-rotate 20s linear infinite",
            }}
          >
            <div
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400"
              style={{ boxShadow: "0 0 10px #06b6d4" }}
            />
          </div>
          {/* Middle ring */}
          <div
            className="absolute inset-[15%] rounded-full"
            style={{
              border: "1px solid rgba(124,58,237,0.12)",
              animation: "lp-orb-rotate 15s linear infinite reverse",
            }}
          >
            <div
              className="absolute -right-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-violet-400"
              style={{ boxShadow: "0 0 8px #8b5cf6" }}
            />
          </div>
          {/* Core glow */}
          <div
            className="absolute inset-[30%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)",
              animation: "lp-pulse-glow 4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container-page relative z-10 flex min-h-[100vh] flex-col items-center justify-center pb-20 pt-32">
        <div
          className="mx-auto max-w-4xl text-center"
          style={{ animation: "lp-fade-up 1s ease-out both" }}
        >
          {/* Badge */}
          <div
            className="lp-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300/80"
            style={{ animation: "lp-fade-up 1s ease-out both 0.2s" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            {t("badge")}
          </div>

          {/* Title */}
          <h1
            className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animation: "lp-fade-up 1s ease-out both 0.3s" }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #fff 0%, #e0e7ff 30%, #0ea5e9 60%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("title")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mt-6 max-w-xl text-pretty text-base text-white/40 md:text-lg"
            style={{ animation: "lp-fade-up 1s ease-out both 0.5s" }}
          >
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animation: "lp-fade-up 1s ease-out both 0.7s" }}
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                boxShadow: "0 0 30px rgba(14,165,233,0.3), 0 0 80px rgba(124,58,237,0.15)",
              }}
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {t("ctaSecondary")}
            </a>
          </div>

          {/* Stats */}
          <div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm"
            style={{ animation: "lp-fade-up 1s ease-out both 0.9s" }}
          >
            {[t("stats.users"), t("stats.bots"), t("stats.uptime")].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-white/30">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: i === 0 ? "#0ea5e9" : i === 1 ? "#7c3aed" : "#06b6d4",
                    boxShadow: `0 0 6px ${i === 0 ? "#0ea5e9" : i === 1 ? "#7c3aed" : "#06b6d4"}`,
                  }}
                />
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Browser mockup */}
        <div
          className="mx-auto mt-20 w-full max-w-5xl"
          style={{ animation: "lp-fade-up 1.2s ease-out both 1.1s" }}
        >
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(14,165,233,0.05)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-4 rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/20">
                app.botspace.uz
              </span>
            </div>
            <div className="relative aspect-[16/9]">
              {/* Flow builder mockup */}
              <div className="absolute inset-0 p-8">
                {/* Floating node cards */}
                {[
                  { x: "10%", y: "15%", label: "/start", color: "#0ea5e9", delay: "0s" },
                  { x: "40%", y: "10%", label: "Send Message", color: "#7c3aed", delay: "0.5s" },
                  { x: "70%", y: "20%", label: "AI Agent", color: "#06b6d4", delay: "1s" },
                  { x: "25%", y: "55%", label: "Keyboard", color: "#8b5cf6", delay: "1.5s" },
                  { x: "55%", y: "60%", label: "Condition", color: "#0ea5e9", delay: "2s" },
                  { x: "75%", y: "55%", label: "Save State", color: "#7c3aed", delay: "2.5s" },
                ].map((node, i) => (
                  <div
                    key={i}
                    className="absolute rounded-lg px-4 py-2"
                    style={{
                      left: node.x,
                      top: node.y,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${node.color}30`,
                      boxShadow: `0 0 20px ${node.color}10`,
                      animation: `lp-float ${5 + i}s ease-in-out infinite ${node.delay}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: node.color, boxShadow: `0 0 6px ${node.color}` }}
                      />
                      <span className="text-xs text-white/50">{node.label}</span>
                    </div>
                  </div>
                ))}
                {/* Connection lines SVG */}
                <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.15 }}>
                  <line x1="20%" y1="22%" x2="45%" y2="17%" stroke="url(#lg1)" strokeWidth="1" />
                  <line x1="50%" y1="17%" x2="75%" y2="27%" stroke="url(#lg2)" strokeWidth="1" />
                  <line x1="15%" y1="25%" x2="30%" y2="60%" stroke="url(#lg1)" strokeWidth="1" />
                  <line x1="50%" y1="20%" x2="60%" y2="65%" stroke="url(#lg2)" strokeWidth="1" />
                  <defs>
                    <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to top, #06060a, transparent)" }}
      />
    </section>
  );
}
