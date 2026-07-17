"use client";

// Umami analytics — aniq NOMLI eventlar (generic "click" emas).
// Asosiy <Script> pageview + web-vitals'ni avtomatik yig'adi. Bu yerda esa
// muhim harakatlar uchun nomli event helper'lari va foydalanuvchi identify.

import { useEffect } from "react";

import { AUTH_EVENT_COOKIE } from "@/shared/lib/constants";

type UmamiApi = {
  track: (event?: string, data?: Record<string, unknown>) => void;
  identify: (data: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

/** Past darajadagi helper — ixtiyoriy joyda nomli event yuborish uchun. */
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") window.umami?.track(event, data);
}

// Script `defer` bilan yuklanadi — sahifa ochilishida ishga tushadigan eventlar
// (identify, auth) undan oldin kelishi mumkin. 10s kutamiz, keyin voz kechamiz.
const UMAMI_POLL_MS = 200;
const UMAMI_MAX_TRIES = 50;

/** Umami API tayyor bo'lganda `fn` ni chaqiradi; qaytgan funksiya kutishni bekor qiladi. */
function whenUmamiReady(fn: (api: UmamiApi) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let tries = 0;
  const timer = setInterval(() => {
    if (window.umami) {
      clearInterval(timer);
      fn(window.umami);
    } else if (++tries > UMAMI_MAX_TRIES) {
      clearInterval(timer);
    }
  }, UMAMI_POLL_MS);
  return () => clearInterval(timer);
}

/** Aniq nomli eventlar — call-site'lar toza va nomi bir xil bo'lishi uchun. */
export const analytics = {
  // Auth
  login: (method?: string) => track("login", { method }),
  logout: () => track("logout"),
  register: (method?: string) => track("register", { method }),
  // Loyiha / bot
  projectCreated: (d?: Record<string, unknown>) => track("project-created", d),
  projectDeleted: (d?: Record<string, unknown>) => track("project-deleted", d),
  botRenamed: (d?: Record<string, unknown>) => track("bot-renamed", d),
  botTokenSet: (d?: Record<string, unknown>) => track("bot-token-set", d),
  botDebugRun: (d?: Record<string, unknown>) => track("bot-debug-run", d),
  botDebugStopped: (d?: Record<string, unknown>) => track("bot-debug-stopped", d),
  botReleased: (d?: Record<string, unknown>) => track("bot-released", d),
  botStopped: (d?: Record<string, unknown>) => track("bot-stopped", d),
  botRollback: (d?: Record<string, unknown>) => track("bot-rollback", d),
  // Credentials
  credentialCreated: (d?: Record<string, unknown>) => track("credential-created", d),
  credentialUpdated: (d?: Record<string, unknown>) => track("credential-updated", d),
  credentialDeleted: (d?: Record<string, unknown>) => track("credential-deleted", d),
  credentialTested: (d?: Record<string, unknown>) => track("credential-tested", d),
  credentialOauthStart: (d?: Record<string, unknown>) => track("credential-oauth-start", d),
  // AI agent
  agentPrompt: (d?: Record<string, unknown>) => track("ai-agent-prompt", d),
  // Monetizatsiya
  planUpgrade: (d?: Record<string, unknown>) => track("plan-upgrade", d),
  paymentStarted: (d?: Record<string, unknown>) => track("payment-started", d),
  templateOrdered: (d?: Record<string, unknown>) => track("template-ordered", d),
  // CMS / collections
  collectionCreated: (d?: Record<string, unknown>) => track("collection-created", d),
  collectionDeleted: (d?: Record<string, unknown>) => track("collection-deleted", d),
  documentInserted: (d?: Record<string, unknown>) => track("document-inserted", d),
  // Fayllar
  fileUploaded: (d?: Record<string, unknown>) => track("file-uploaded", d),
  // Broadcast / messaging
  broadcastSent: (d?: Record<string, unknown>) => track("broadcast-sent", d),
  // API tokenlar
  apiTokenCreated: (d?: Record<string, unknown>) => track("api-token-created", d),
};

/** Login bo'lganda session'ni Umami'ga bog'laydi (qaysi user nima qildi). */
export function UmamiIdentify({
  userId,
  role,
  username,
}: {
  userId: string | number;
  role?: string;
  username?: string;
}) {
  useEffect(() => {
    if (!userId) return;
    return whenUmamiReady((api) => api.identify({ userId: String(userId), role, username }));
  }, [userId, role, username]);

  return null;
}

const AUTH_EVENT_RE = /^(login|register):(telegram|google)$/;

/**
 * O'qiladi va darhol tozalanadi — cookie'ni ko'rgan birinchi sahifa egallaydi,
 * shuning uchun event bir marta yuboriladi (React StrictMode qayta-mount qilsa ham).
 */
function consumeAuthEvent(): { action: string; method: string } | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${AUTH_EVENT_COOKIE}=`))
    ?.slice(AUTH_EVENT_COOKIE.length + 1);
  if (!raw) return null;
  document.cookie = `${AUTH_EVENT_COOKIE}=; Max-Age=0; path=/`;

  // Cookie foydalanuvchi tomonidan o'zgartirilishi mumkin — faqat kutilgan
  // qiymatlarni qabul qilamiz, aks holda Umami'ga soxta event nomi ketadi.
  const match = AUTH_EVENT_RE.exec(decodeURIComponent(raw));
  return match ? { action: match[1], method: match[2] } : null;
}

/**
 * Auth route handler qo'ygan cookie'ni o'qib, kirish/ro'yxatdan o'tishni
 * Umami'ga yuboradi. Login oqimlari qattiq navigatsiya bilan tugaydi, shuning
 * uchun event bosilganda emas, kelib tushgan sahifada yuboriladi.
 */
export function UmamiAuthEvent() {
  useEffect(() => {
    const evt = consumeAuthEvent();
    if (!evt) return;
    return whenUmamiReady(() =>
      evt.action === "register" ? analytics.register(evt.method) : analytics.login(evt.method),
    );
  }, []);

  return null;
}
