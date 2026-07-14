export const APP = {
  name: "BotSpace",
  tagline: "Telegram botlaringizni vizual konstruktor bilan yarating",
  supportEmail: "support@botspace.uz",
} as const;

export const PAGINATION_SIZE = 20;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const OTP_LENGTH = 6;
export const MIN_PASSWORD = 8;

// Go backend (internal/modules/auth) issues short-lived access tokens and a
// 7-day refresh token (see config/JWT TTLs in internal/shared/config) — the
// session cookie's own JWT lifetime must not outlive the refresh token it
// carries, otherwise middleware. loadSession() ends up with a cookie that
// decodes fine but whose embedded refresh token the backend already expired.
export const ACCESS_TOKEN_TTL_SEC = 60 * 15; // 15m
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7d

// Non-httpOnly one-shot cookie set on first-ever sign-in (backend is_new=true).
// The client onboarding tour reads it, clears it, then tracks completion in
// localStorage so the tour only ever runs once for a freshly registered user.
export const ONBOARDING_COOKIE = "bs_onboarding";
