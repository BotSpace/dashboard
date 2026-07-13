"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { env } from "@/shared/lib/env";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleButton({ label, from }: { label: string; from?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const locale = useLocale();
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // `from` is locale-less (e.g. "/templates/slug"); land there after login,
  // falling back to the app. Guard against an already-localized value.
  const target = (() => {
    if (!from || !from.startsWith("/") || from === "/") return `/${locale}/app`;
    if (from === `/${locale}` || from.startsWith(`/${locale}/`)) return from;
    return `/${locale}${from}`;
  })();

  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, [clientId]);

  useEffect(() => {
    if (!loaded || !clientId || !ref.current) return;
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        // Route handler cookie'ni JSON javobga yozadi (server action emas) →
        // qattiq navigatsiya bilan ilovaga kiramiz, cookie qo'llanadi.
        try {
          const r = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id_token: credential }),
          });
          if (r.ok) {
            window.location.href = target;
          } else {
            toast.error("Google login failed");
          }
        } catch {
          toast.error("Google login failed");
        }
      },
    });
    window.google?.accounts.id.renderButton(ref.current, {
      theme: "outline",
      size: "large",
      width: ref.current.clientWidth,
      text: "continue_with",
    });
  }, [loaded, clientId, locale, target]);

  if (!clientId) {
    return (
      <Button variant="outline" className="w-full" disabled>
        {label}
      </Button>
    );
  }

  return <div ref={ref} className="flex w-full justify-center" />;
}
