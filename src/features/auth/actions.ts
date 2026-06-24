"use server";
import { apiFetch, isApiError } from "@/shared/api/client";
import { setSessionCookie, clearSessionCookie, type SessionUser } from "@/shared/auth/session";

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: Record<string, unknown>;
};

type Tokens = { access: string; refresh: string };

// Backend response shapes vary by endpoint:
//   /authbot/login/      { user, token: {access, refresh} }
//   /api/v1/auth/google  { data: { user, token: {access, refresh} } }
function extractTokens(res: unknown): { tokens: Tokens | null; user: SessionUser | null } {
  if (!res || typeof res !== "object") return { tokens: null, user: null };
  const r = res as Record<string, unknown>;
  const root = (r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r) as Record<string, unknown>;
  const token = root.token as Record<string, unknown> | undefined;
  const access = (token?.access as string | undefined) ?? (root.access as string | undefined);
  const refresh = (token?.refresh as string | undefined) ?? (root.refresh as string | undefined);
  const user = (root.user as SessionUser | undefined) ?? (root as SessionUser);
  if (!access || !refresh) return { tokens: null, user: user ?? null };
  return { tokens: { access, refresh }, user };
}

async function fetchMe(access: string): Promise<SessionUser | undefined> {
  try {
    const d = await apiFetch<{ status?: boolean; data?: SessionUser } & SessionUser>("/auth/me/", {
      token: access,
    });
    return (d?.data as SessionUser) ?? (d as SessionUser);
  } catch {
    return undefined;
  }
}

async function persistSession(rawRes: unknown) {
  const { tokens, user } = extractTokens(rawRes);
  if (!tokens) throw new Error("Backend tokenlarni qaytarmadi");
  const finalUser =
    user && user.id !== undefined ? user : (await fetchMe(tokens.access)) ?? ({ id: 0 } as SessionUser);
  await setSessionCookie({ access: tokens.access, refresh: tokens.refresh, user: finalUser });
}

export async function telegramLoginAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, message: "Kod 6 xonali raqam bo'lishi kerak" };

  try {
    const res = await apiFetch<unknown>("/authbot/login/", {
      method: "POST",
      json: { code: Number(code) },
      skipAuth: true,
    });
    await persistSession(res);
    return { ok: true };
  } catch (e) {
    if (isApiError(e)) {
      const details = e.details as { code?: string[]; detail?: string } | undefined;
      const msg = details?.code?.[0] ?? details?.detail ?? e.message;
      return { ok: false, message: msg || "Kod noto'g'ri yoki muddati o'tgan" };
    }
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}

export async function googleLoginAction(idToken: string): Promise<ActionState> {
  try {
    const res = await apiFetch<unknown>("/api/v1/auth/google", {
      method: "POST",
      json: { id_token: idToken },
      skipAuth: true,
    });
    await persistSession(res);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Google bilan kirishda xatolik" };
  }
}

// Sessiya cookie'sini tozalaydi. Navigatsiyani klient qiladi (window.location)
// — server redirect Radix onSelect ichida ishonchli ishlamaydi.
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
}
