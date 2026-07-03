"use server";
import { apiFetch, isApiError } from "@/shared/api/client";
import { setSessionCookie, type SessionUser } from "@/shared/auth/session";

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: Record<string, unknown>;
};

type Tokens = { access: string; refresh: string };

// Go backend (internal/modules/authbot) LoginResponse: raw JSON, no envelope —
// { user: {id,phone,first_name,last_name,role}, token: {access_token,refresh_token,...} }.
function extractTokens(res: unknown): { tokens: Tokens | null; user: SessionUser | null } {
  if (!res || typeof res !== "object") return { tokens: null, user: null };
  const root = res as Record<string, unknown>;
  const token = root.token as Record<string, unknown> | undefined;
  const access = (token?.access_token as string | undefined) ?? (root.access_token as string | undefined);
  const refresh = (token?.refresh_token as string | undefined) ?? (root.refresh_token as string | undefined);
  const user = (root.user as SessionUser | undefined) ?? (root as SessionUser);
  if (!access || !refresh) return { tokens: null, user: user ?? null };
  return { tokens: { access, refresh }, user };
}

async function fetchMe(access: string): Promise<SessionUser | undefined> {
  try {
    // GET /api/v1/users/me -> UserResponse, raw JSON (no envelope).
    return await apiFetch<SessionUser>("/api/v1/users/me", { token: access });
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
    // internal/modules/authbot: LoginRequest.Code is a STRING ("required,len=6,numeric") —
    // sending a JSON number here fails gin's binding, so keep it a string.
    const res = await apiFetch<unknown>("/api/v1/authbot/login", {
      method: "POST",
      json: { code },
      skipAuth: true,
    });
    await persistSession(res);
    return { ok: true };
  } catch (e) {
    if (isApiError(e)) {
      return { ok: false, message: e.message || "Kod noto'g'ri yoki muddati o'tgan" };
    }
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}

// Eslatma: login (telegram + google) va logout endi ROUTE HANDLER'lar orqali:
//   /api/auth/telegram, /api/auth/google, /api/auth/logout
// Sabab: server action'da o'rnatilgan/o'chirilgan cookie brauzerga ishonchli
// qo'llanmasdi. Route handler'lar Set-Cookie'ni doim chiqaradi.
