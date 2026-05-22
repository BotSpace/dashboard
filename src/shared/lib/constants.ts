export const APP = {
  name: "Botmother",
  tagline: "Telegram botlaringizni vizual konstruktor bilan yarating",
  supportEmail: "support@botmother.uz",
} as const;

export const PAGINATION_SIZE = 20;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const OTP_LENGTH = 6;
export const MIN_PASSWORD = 8;

export const ACCESS_TOKEN_TTL_SEC = 60 * 60; // 1h
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30d
