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

// Xato matnlari server'dan keladi va uzun bo'lishi mumkin — Umami'da har xil
// matn alohida qiymat bo'lib, hisobotni ishlatib bo'lmas holga keltiradi.
const MAX_VALUE_LEN = 80;

/** Uzun matnlarni qirqadi va bo'sh (undefined) maydonlarni tashlab yuboradi. */
function clean(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = typeof v === "string" && v.length > MAX_VALUE_LEN ? v.slice(0, MAX_VALUE_LEN) : v;
  }
  return Object.keys(out).length ? out : undefined;
}

// Skript `defer` + afterInteractive bilan yuklanadi, ya'ni React effect'lari
// undan OLDIN ishga tushadi. Shu sababli mount'da yuborilgan eventlar (voronka
// boshlanishi: sehrgar ochilishi, qadam ko'rilishi) `window.umami` hali yo'qligi
// uchun jimgina yo'qolardi. Tayyor bo'lguncha navbatga qo'yamiz.
const pending: Array<[string, Record<string, unknown> | undefined]> = [];
const MAX_PENDING = 50; // umami umuman yuklanmasa (adblock) cheksiz o'smasin
let flushScheduled = false;

/** Past darajadagi helper — ixtiyoriy joyda nomli event yuborish uchun. */
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = clean(data);
  if (window.umami) {
    window.umami.track(event, payload);
    return;
  }
  if (pending.length < MAX_PENDING) pending.push([event, payload]);
  if (flushScheduled) return;
  flushScheduled = true;
  whenUmamiReady(
    (api) => {
      for (const [name, d] of pending.splice(0)) api.track(name, d);
      flushScheduled = false;
    },
    // Voz kechildi (adblock?) — bayroqni tushiramiz, keyingi event navbatni
    // qayta urinib ko'radi, aks holda backlog abadiy qotib qolardi.
    () => {
      flushScheduled = false;
    },
  );
}

// Script `defer` bilan yuklanadi — sahifa ochilishida ishga tushadigan eventlar
// (identify, auth) undan oldin kelishi mumkin. 10s kutamiz, keyin voz kechamiz.
const UMAMI_POLL_MS = 200;
const UMAMI_MAX_TRIES = 50;

/** Umami API tayyor bo'lganda `fn` ni chaqiradi; qaytgan funksiya kutishni bekor qiladi. */
function whenUmamiReady(fn: (api: UmamiApi) => void, onGiveUp?: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let tries = 0;
  const timer = setInterval(() => {
    if (window.umami) {
      clearInterval(timer);
      fn(window.umami);
    } else if (++tries > UMAMI_MAX_TRIES) {
      clearInterval(timer);
      onGiveUp?.();
    }
  }, UMAMI_POLL_MS);
  return () => clearInterval(timer);
}

type Data = Record<string, unknown> | undefined;

/**
 * Aniq nomli eventlar — call-site'lar toza va nomi bir xil bo'lishi uchun.
 *
 * Voronka (funnel) qoidasi: har bir oqim uchun kamida uchta event bor —
 * `…Clicked/Started` (niyat), `…` (muvaffaqiyat) va `…Failed` (xato sababi
 * bilan). Ikkitasi orasidagi farq — foydalanuvchi tushib qolgan joy.
 * Umami'da bosqichlarni sanab, qaysi qadamda yo'qotayotganimizni ko'ramiz.
 */
export const analytics = {
  // Auth
  login: (method?: string) => track("login", { method }),
  logout: () => track("logout"),
  register: (method?: string) => track("register", { method }),

  // ── Bot yaratish voronkasi ──────────────────────────────────────────
  // `source` — tugma qayerdan bosilgani (dashboard/bots-list/empty-state…),
  // `mode` — telegram (managed) / manual (token) / debug.
  botCreateClicked: (d?: Data) => track("bot-create-clicked", d),
  /** Sehrgarning har bir qadami ko'rilganda. `step`: bot/settings/confirm/launch. */
  botCreateStep: (d?: Data) => track("bot-create-step", d),
  /** Sehrgardan chiqib ketdi (birinchi qadamdan orqaga) — tashlab ketish. */
  botCreateExit: (d?: Data) => track("bot-create-exit", d),
  botCreateFailed: (d?: Data) => track("bot-create-failed", d),
  projectCreated: (d?: Data) => track("project-created", d),
  /** Bot yaratildi-yu, ishga tushdimi? running/failed/timeout/no_connect. */
  botLaunchResult: (d?: Data) => track("bot-launch-result", d),

  // ── Managed bot (@BotFather havolasi orqali ulash) ──────────────────
  managedBotLinkOpened: (d?: Data) => track("managed-bot-link-opened", d),
  managedBotConnected: (d?: Data) => track("managed-bot-connected", d),
  /** Havola ochildi, lekin bot 2 daqiqada ulanmadi — jim yo'qotish. */
  managedBotTimeout: (d?: Data) => track("managed-bot-timeout", d),

  // ── Shablondan bot yaratish ─────────────────────────────────────────
  templateOrdered: (d?: Data) => track("template-ordered", d),
  templateCreateClicked: (d?: Data) => track("template-create-clicked", d),

  // Loyiha / bot hayotiy sikli
  projectDeleted: (d?: Data) => track("project-deleted", d),
  botRenamed: (d?: Data) => track("bot-renamed", d),
  botTokenSet: (d?: Data) => track("bot-token-set", d),
  botTokenSetFailed: (d?: Data) => track("bot-token-set-failed", d),
  botDebugRun: (d?: Data) => track("bot-debug-run", d),
  botDebugStopped: (d?: Data) => track("bot-debug-stopped", d),
  botReleased: (d?: Data) => track("bot-released", d),
  botStopped: (d?: Data) => track("bot-stopped", d),
  botRollback: (d?: Data) => track("bot-rollback", d),
  /** Tarif limitiga urildi — kuchli "tarif oshirish" niyati signali. */
  runningBotLimitHit: (d?: Data) => track("running-bot-limit-hit", d),

  // ── Credentials voronkasi ───────────────────────────────────────────
  credentialCreateStarted: (d?: Data) => track("credential-create-started", d),
  credentialTypeSelected: (d?: Data) => track("credential-type-selected", d),
  credentialCreated: (d?: Data) => track("credential-created", d),
  credentialCreateFailed: (d?: Data) => track("credential-create-failed", d),
  credentialUpdated: (d?: Data) => track("credential-updated", d),
  credentialDeleted: (d?: Data) => track("credential-deleted", d),
  credentialTested: (d?: Data) => track("credential-tested", d),
  credentialOauthStart: (d?: Data) => track("credential-oauth-start", d),
  credentialOauthDone: (d?: Data) => track("credential-oauth-done", d),
  /** OAuth oynasi yopildi yoki muddati tugadi — jim yo'qotish. */
  credentialOauthAbandoned: (d?: Data) => track("credential-oauth-abandoned", d),

  // AI agent
  agentPrompt: (d?: Data) => track("ai-agent-prompt", d),

  // ── Monetizatsiya ───────────────────────────────────────────────────
  planUpgradeClicked: (d?: Data) => track("plan-upgrade-clicked", d),
  planUpgrade: (d?: Data) => track("plan-upgrade", d),
  planUpgradeFailed: (d?: Data) => track("plan-upgrade-failed", d),
  topUpClicked: (d?: Data) => track("top-up-clicked", d),
  /**
   * Summa kiritilib, to'lov urinishi boshlandi. DIQQAT: bu pul kelgani emas —
   * Click'dan qaytish sahifasi yo'q, shuning uchun haqiqiy to'lovni faqat
   * backend biladi. `payment-started` − `top-up-failed` = Click'ga o'tganlar.
   */
  paymentStarted: (d?: Data) => track("payment-started", d),
  topUpFailed: (d?: Data) => track("top-up-failed", d),

  // CMS / collections
  collectionCreated: (d?: Data) => track("collection-created", d),
  collectionDeleted: (d?: Data) => track("collection-deleted", d),
  documentInserted: (d?: Data) => track("document-inserted", d),
  // Fayllar
  fileUploaded: (d?: Data) => track("file-uploaded", d),
  // Broadcast / messaging
  broadcastSent: (d?: Data) => track("broadcast-sent", d),
  // API tokenlar
  apiTokenCreated: (d?: Data) => track("api-token-created", d),
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
    // `track` skript hali yuklanmagan bo'lsa o'zi navbatga qo'yadi.
    if (evt.action === "register") analytics.register(evt.method);
    else analytics.login(evt.method);
  }, []);

  return null;
}
