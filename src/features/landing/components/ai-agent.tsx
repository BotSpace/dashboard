"use client";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const AIKitchenScene = dynamic(() => import("./ai-kitchen-scene"), { ssr: false });

const BG = "#030308";


export function AIAgent() {
  return (
    <SectionWrapper className="relative py-24 md:py-36" style={{ background: BG }}>
      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              background: i % 2 === 0 ? "#8b5cf6" : "#00e5ff",
              opacity: 0.15,
              animation: `lp-drift ${8 + (i % 6)}s ease-in-out infinite ${i % 4}s`,
            }}
          />
        ))}
      </div>

      <div className="container-page">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.12)",
                color: "rgba(139,92,246,0.7)",
              }}
            >
              <Sparkles className="h-3 w-3" />
              AI Agent
            </div>
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
              style={{
                background: "linear-gradient(135deg, #fff 25%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Tabiiy tilda bot yarating
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/30">
              AI agent bilan gaplashing — u flow tuzadi, node qo&apos;shadi, deploy qiladi.
              Kod yozish shart emas.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Flow tuzish", "Deploy", "CRM", "Broadcast", "Analitika"].map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.06 }}
                  className="cursor-default rounded-full px-3 py-1 text-[11px] font-medium text-white/25 transition-colors hover:text-white/40"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D AI Kitchen */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="aspect-square w-full max-w-[500px] mx-auto"
          >
            <AIKitchenScene />
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
