import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale = "uz") {
  return new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : locale).format(value);
}

export function formatCurrency(value: number, currency = "UZS", locale = "uz") {
  try {
    return new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${formatNumber(value, locale)} ${currency}`;
  }
}

export function initials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
