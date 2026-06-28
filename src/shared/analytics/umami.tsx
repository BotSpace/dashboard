"use client";

// Umami analytics — global avtomatik tracker + foydalanuvchi identifikatsiyasi.
// Asosiy <Script> pageview'larni (sahifa, referrer, brauzer/OS, davlat, vaqt)
// avtomatik yig'adi. Bu yerda qo'shimcha: HAR bosish (tugma/link), forma yuborish,
// tashqi link va login'da userId bog'lash — har komponentga tegmasdan, global.

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

function track(event: string, data?: Record<string, unknown>) {
  window.umami?.track(event, data);
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Global click/submit/outbound tracker — root layout'ga bir marta o'rnatiladi. */
export function UmamiTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest?.(
        'a,button,[role="button"],input[type="submit"],input[type="button"]'
      ) as HTMLElement | null;
      if (!el) return;

      const label = clean(
        el.getAttribute("aria-label") ||
          (el as HTMLInputElement).value ||
          el.textContent ||
          ""
      );
      const href = el.getAttribute("href") || undefined;
      const data: Record<string, unknown> = {
        label: label || el.tagName.toLowerCase(),
        tag: el.tagName.toLowerCase(),
        path: location.pathname,
      };
      if (href) {
        data.href = href;
        try {
          const u = new URL(href, location.href);
          if (u.host && u.host !== location.host) {
            track("outbound", { href: u.href, path: location.pathname });
          }
        } catch {
          /* relative/hash href — e'tiborsiz */
        }
      }
      track("click", data);
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLElement | null;
      if (!form || form.tagName !== "FORM") return;
      track("form-submit", {
        form:
          form.getAttribute("id") ||
          form.getAttribute("name") ||
          form.getAttribute("aria-label") ||
          "form",
        path: location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}

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
