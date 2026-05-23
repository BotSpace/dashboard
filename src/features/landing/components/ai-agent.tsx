"use client";
import { Bot, User, Sparkles } from "lucide-react";

export function AIAgent() {
  const messages = [
    { role: "user" as const, text: "Mijozlarga xizmat ko'rsatuvchi bot yarat" },
    { role: "bot" as const, text: "Flow tuzamiz: /start trigger → salomlashish → menyu. 3 ta node qo'shildi, ulayman..." },
    { role: "bot" as const, text: "✅ Bot tayyor. /start bossangiz menyu chiqadi. Deploy qilaymi?" },
    { role: "user" as const, text: "Ha, deploy qil" },
    { role: "bot" as const, text: "🚀 Bot ishga tushdi! @support_bot dan tekshiring." },
  ];

  return (
    <section className="relative py-24 md:py-32" style={{ background: "#06060a" }}>
      {/* Neural dots background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              width: "2px",
              height: "2px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `lp-drift ${8 + Math.random() * 6}s ease-in-out infinite ${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-violet-300/70" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <Sparkles className="h-3 w-3" />
              AI Agent
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl" style={{ background: "linear-gradient(135deg, #fff 30%, #7c3aed 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Tabiiy tilda bot yarating
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/35">
              AI agent bilan gaplashing — u flow tuzadi, node qo'shadi, deploy qiladi.
              Kod yozish shart emas — faqat nima kerakligini ayting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Flow tuzish", "Deploy", "CRM", "Broadcast", "Analitika"].map((tag) => (
                <span key={tag} className="rounded-full px-3 py-1 text-xs text-white/30" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: chat mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.05)" }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #0ea5e9, #7c3aed)" }}>
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
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`} style={{ animation: `lp-fade-up 0.5s ease-out both ${0.3 + i * 0.4}s` }}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: msg.role === "user" ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #0ea5e930, #7c3aed30)" }}>
                      {msg.role === "user" ? <User className="h-3 w-3 text-white/40" /> : <Bot className="h-3 w-3 text-cyan-400/60" />}
                    </div>
                    <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${msg.role === "user" ? "text-white/60" : "text-white/50"}`} style={{ background: msg.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(14,165,233,0.06)", border: `1px solid ${msg.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(14,165,233,0.08)"}` }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
