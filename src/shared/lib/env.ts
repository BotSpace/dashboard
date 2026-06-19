import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_TELEGRAM_BOT: z.string().default("botmother_authbot"),
  NEXT_PUBLIC_CONSTRUCTOR_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_AGENT_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["uz", "en", "ru"]).default("uz"),
  SESSION_COOKIE_NAME: z.string().default("bm_session"),
  SESSION_COOKIE_DOMAIN: z.string().optional(),
  SESSION_SECRET: z.string().min(16),
  HANDOVER_SECRET: z.string().min(16).optional(),
  AGENT_INTERNAL_API_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_TELEGRAM_BOT: process.env.NEXT_PUBLIC_TELEGRAM_BOT,
  NEXT_PUBLIC_CONSTRUCTOR_URL: process.env.NEXT_PUBLIC_CONSTRUCTOR_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_AGENT_URL: process.env.NEXT_PUBLIC_AGENT_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
  SESSION_SECRET: process.env.SESSION_SECRET,
  HANDOVER_SECRET: process.env.HANDOVER_SECRET,
  AGENT_INTERNAL_API_TOKEN: process.env.AGENT_INTERNAL_API_TOKEN,
});

// `next build` modullarni baholaydi, lekin runtime sirlar (SESSION_SECRET) o'sha
// paytda mavjud emas — shuning uchun build fazasida throw qilmaymiz.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
// Bu modul client bundle'ga ham kiradi. Brauzerda SESSION_SECRET kabi server
// sirlari HECH QACHON mavjud bo'lmaydi (NEXT_PUBLIC_ emas) — shuning uchun
// brauzerda throw qilmaymiz, aks holda sahifa oq ekran bilan yiqiladi. Validatsiya
// va throw faqat serverda (SSR / middleware / server action) ishlaydi.
const isServer = typeof window === "undefined";

if (!parsed.success) {
  if (isServer && process.env.NODE_ENV === "production" && !isBuildPhase) {
    // Production runtime'da (server) noto'g'ri/yo'q env bilan ishlamaymiz — forge
    // qilinadigan default sir bilan jim ishga tushishdan ko'ra tez xato beramiz.
    throw new Error(
      "[env] missing/invalid required env vars: " +
        JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }
  if (isServer && process.env.NODE_ENV !== "production") {
    console.warn("[env] missing/invalid env vars:", parsed.error.flatten().fieldErrors);
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.botspace.uz",
      NEXT_PUBLIC_TELEGRAM_BOT: process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "botmother_authbot",
      NEXT_PUBLIC_CONSTRUCTOR_URL: process.env.NEXT_PUBLIC_CONSTRUCTOR_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_AGENT_URL: process.env.NEXT_PUBLIC_AGENT_URL,
      NEXT_PUBLIC_DEFAULT_LOCALE: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "uz") as "uz" | "en" | "ru",
      SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bm_session",
      SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
      // Production'da forge qilinadigan ma'lum default ishlatilmaydi (yuqorida
      // throw qilinadi). Faqat dev qulaylik uchun default beriladi.
      SESSION_SECRET:
        process.env.SESSION_SECRET ??
        (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me-please-32chars"),
      HANDOVER_SECRET: process.env.HANDOVER_SECRET,
      AGENT_INTERNAL_API_TOKEN: process.env.AGENT_INTERNAL_API_TOKEN,
    };
