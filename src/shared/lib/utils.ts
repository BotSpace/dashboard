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

// Uzbek month names — ICU "uz" data is unreliable across runtimes and
// often falls back to English ("June 10, 2026"), so format Uzbek dates
// explicitly. Other locales use Intl.
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

export function formatLongDate(value: string | null | undefined, locale = "uz"): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  if (locale === "uz") {
    return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  }
  try {
    return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
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
