"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "BotSpace bepulmi?", a: "Ha, Free tarif bilan 1 ta bot va oyiga 200K AI token bepul. Karta talab qilinmaydi." },
  { q: "Kod yozish kerakmi?", a: "Yo'q. Vizual konstruktor yoki AI agent bilan tabiiy tilda bot yaratishingiz mumkin." },
  { q: "Qanday to'lov usullari bor?", a: "Payme, Click va xalqaro kartalar (Visa/Mastercard) orqali to'lash mumkin." },
  { q: "AI agent nima qila oladi?", a: "Flow tuzadi, node qo'shadi, deploy qiladi, CRM boshqaradi, broadcast yuboradi — barchasi tabiiy tilda." },
  { q: "Botni boshqa platformalarga ulasa bo'ladimi?", a: "Hozircha Telegram to'liq qo'llab-quvvatlanadi. Boshqa kanallar tez orada qo'shiladi." },
  { q: "MCP server nima?", a: "Claude Desktop yoki Cursor kabi AI agentlar orqali BotSpace platformasini boshqarish imkonini beradi." },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32" style={{ background: "#06060a" }}>
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{
              background: "linear-gradient(135deg, #fff 40%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Ko'p beriladigan savollar
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl transition-all duration-300"
              style={{
                background: openIdx === i ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
                border: `1px solid ${openIdx === i ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-white/80">{faq.q}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-white/30 transition-transform duration-300"
                  style={{ transform: openIdx === i ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: openIdx === i ? "200px" : "0", opacity: openIdx === i ? 1 : 0 }}
              >
                <p className="px-5 pb-4 text-sm leading-relaxed text-white/35">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
