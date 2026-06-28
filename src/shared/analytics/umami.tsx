"use client";

// Umami analytics — aniq NOMLI eventlar (generic "click" emas).
// Asosiy <Script> pageview + web-vitals'ni avtomatik yig'adi. Bu yerda esa
// muhim harakatlar uchun nomli event helper'lari va foydalanuvchi identify.

import { useEffect } from "react";

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
    let tries = 0;
    const timer = setInterval(() => {
      if (window.umami?.identify) {
        window.umami.identify({ userId: String(userId), role, username });
        clearInterval(timer);
      } else if (++tries > 50) {
        clearInterval(timer);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [userId, role, username]);

  return null;
}
