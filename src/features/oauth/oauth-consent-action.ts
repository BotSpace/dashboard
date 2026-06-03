"use server";

import { readSession } from "@/shared/auth/session";
import { apiFetch } from "@/shared/api/client";
import { env } from "@/shared/lib/env";

export type OAuthParams = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  code_challenge: string;
  code_challenge_method: string;
  state?: string;
  scope?: string;
  resource?: string;
};

export type OAuthMeta = {
  client_name: string;
  redirect_uri: string;
};

type Envelope<T> = { status?: boolean; data?: T } | T;

function unwrap<T>(d: unknown): T {
  if (d && typeof d === "object" && "data" in (d as Record<string, unknown>)) {
    return (d as { data: T }).data;
  }
  return d as T;
}

export async function fetchOAuthMeta(params: OAuthParams): Promise<{ meta?: OAuthMeta; error?: string }> {
  try {
    const apiBase = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    const url = new URL(`${apiBase}/auth/oauth/authorize/meta/`);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
    const raw = await apiFetch<Envelope<OAuthMeta>>(url.pathname + url.search, {
      skipAuth: true,
    });
    const meta = unwrap<OAuthMeta>(raw);
    if (!meta?.client_name) return { error: "Noto'g'ri OAuth parametrlari" };
    return { meta };
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : "OAuth so'rovi tekshirishda xatolik";
    return { error: msg };
  }
}

export async function approveOAuthAction(
  params: OAuthParams
): Promise<{ redirectUrl?: string; error?: string }> {
  const session = await readSession();
  if (!session) {
    return { error: "Avval tizimga kiring" };
  }
  try {
    const raw = await apiFetch<Envelope<{ redirect_url: string }>>(
      "/auth/oauth/authorize/approve/",
      {
        method: "POST",
        json: params,
        token: session.access,
      }
    );
    const data = unwrap<{ redirect_url: string }>(raw);
    if (!data?.redirect_url) return { error: "Kutilmagan server javobi" };
    return { redirectUrl: data.redirect_url };
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : "Tasdiqlashda xatolik";
    return { error: msg };
  }
}
