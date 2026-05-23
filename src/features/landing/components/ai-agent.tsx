"use client";
import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const BG = "#030308";

const messages = [
  { role: "user" as const, text: "Mijozlarga xizmat ko'rsatuvchi bot yarat" },
  { role: "bot" as const, text: "Flow tuzamiz: /start trigger → salomlashish → menyu. 3 ta node qo'shildi..." },
  { role: "bot" as const, text: "✅ Bot tayyor. Deploy qilaymi?" },
  { role: "user" as const, text: "Ha, deploy qil" },
  { role: "bot" as const, text: "🚀 Bot ishga tushdi! @support_bot dan tekshiring." },
];

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

          {/* Right: chat */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.04)",
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #00c8ff, #8b5cf6)" }}
                >
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <div className="text-[12px] font-medium text-white/60">BotSpace Agent</div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" /> Online
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5" style={{ minHeight: 280 }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: msg.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(0,200,255,0.08)",
                      }}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3 w-3 text-white/35" />
                      ) : (
                        <Bot className="h-3 w-3 text-cyan-400/50" />
                      )}
                    </div>
                    <div
                      className="max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed text-white/45"
                      style={{
                        background: msg.role === "user" ? "rgba(255,255,255,0.04)" : "rgba(0,229,255,0.04)",
                        border: `1px solid ${msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(0,229,255,0.06)"}`,
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
