"use server";
import { revalidatePath } from "next/cache";
import { BillingAPI, SubscriptionAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; link?: string; message?: string };

const MIN = 1000;

/**
 * Balansni to'ldirish: summa qabul qilib Click to'lov havolasini qaytaradi.
 * Client komponenti `link` ga redirect qiladi (tashqi to'lov sahifasi).
 */
export async function createTopUpAction(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const raw = String(formData.get("amount") ?? "").replace(/\D/g, "");
  const amount = parseInt(raw, 10);

  if (!raw || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, message: "Summani kiriting" };
  }
  if (amount < MIN) {
    return { ok: false, message: `Minimal summa ${MIN.toLocaleString("uz-UZ")} so'm` };
  }

  try {
    const { link } = await BillingAPI.createTopUp({ method: "click", amount });
    if (!link) return { ok: false, message: "To'lov havolasini olishda xatolik" };
    return { ok: true, link };
  } catch (e) {
    if (isApiError(e)) return { ok: false, message: e.message || "Xatolik yuz berdi" };
    return { ok: false, message: (e as Error).message || "Xatolik yuz berdi" };
  }
}

/**
 * Tarifni yangilash/almashtirish. Backend `total_price`'ni foydalanuvchi
 * balansidan yechib, tarifni darhol almashtiradi (tashqi to'lov yo'q). Balans
 * yetmasa backend xato xabarini qaytaradi ("Balansda yetarli mablag' mavjud emas.").
 */
export async function upgradePlanAction(
  planId: number | string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await SubscriptionAPI.upgrade(planId);
    revalidatePath("/app/billing");
    return { ok: true };
  } catch (e) {
    if (isApiError(e)) return { ok: false, message: e.message || "Tarifni yangilashda xatolik" };
    return { ok: false, message: (e as Error).message || "Tarifni yangilashda xatolik" };
  }
}
