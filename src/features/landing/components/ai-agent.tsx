"use client";
import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const messages = [
  { role: "user" as const, text: "Mijozlarga xizmat ko'rsatuvchi bot yarat" },
  {
    role: "bot" as const,
    text: "Flow tuzamiz: /start trigger → salomlashish → menyu. 3 ta node qo'shildi, ulayman...",
  },
  {
    role: "bot" as const,
    text: "Bot tayyor. /start bossangiz menyu chiqadi. Deploy qilaymi?",
  },
  { role: "user" as const, text: "Ha, deploy qil" },
  { role: "bot" as const, text: "Bot ishga tushdi! @support_bot dan tekshiring." },
];

const tags = ["Flow tuzish", "Deploy", "CRM", "Broadcast", "Analitika"];

const messageVariants = {
  hidden: (role: "user" | "bot") => ({
    opacity: 0,
    x: role === "user" ? 20 : -20,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.18, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function AIAgent() {
  return (
    <SectionWrapper
      className="relative py-24 md:py-32"
      style={{ background: "#06060a" }}
    >
      {/* Neural dots background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              width: "2px",
              height: "2px",
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animation: `lp-drift ${8 + (i % 6)}s ease-in-out infinite ${(i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-violet-300/70"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <Sparkles className="h-3 w-3" />
              AI Agent
            </div>
            <h2
              className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
              style={{
                background: "linear-gradient(135deg, #fff 30%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Tabiiy tilda bot yarating
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/35">
              AI agent bilan gaplashing — u flow tuzadi, node qo&apos;shadi, deploy qiladi.
              Kod yozish shart emas — faqat nima kerakligini ayting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.08 }}
                  className="cursor-default rounded-full px-3 py-1 text-xs text-white/30 transition-colors hover:text-white/50"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Right: chat mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.05)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                  }}
                >
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white/70">BotSpace Agent</div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 p-4" style={{ minHeight: 300 }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={messageVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background:
                          msg.role === "user"
                            ? "rgba(255,255,255,0.08)"
                            : "linear-gradient(135deg, #0ea5e930, #7c3aed30)",
                      }}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3 w-3 text-white/40" />
                      ) : (
                        <Bot className="h-3 w-3 text-cyan-400/60" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.role === "user" ? "text-white/60" : "text-white/50"
                      }`}
                      style={{
                        background:
                          msg.role === "user"
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(14,165,233,0.06)",
                        border: `1px solid ${
                          msg.role === "user"
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(14,165,233,0.08)"
                        }`,
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
