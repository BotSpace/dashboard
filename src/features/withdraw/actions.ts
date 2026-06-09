"use server";
import { revalidatePath } from "next/cache";
import { KycAPI, WithdrawalAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string };

function fail(e: unknown): Result {
  if (isApiError(e)) {
    const details = e.details as
      | { errors?: Record<string, unknown>; detail?: string; data?: Record<string, unknown> }
      | undefined;
    const bag = details?.errors ?? details?.data;
    if (bag && typeof bag === "object") {
      const flat = Object.entries(bag)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("; ");
      if (flat) return { ok: false, message: flat };
    }
    return { ok: false, message: details?.detail || e.message };
  }
  return { ok: false, message: (e as Error).message || "Xatolik yuz berdi" };
}

export async function submitKycAction(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const passport = formData.get("passport_image");
  const selfie = formData.get("selfie_image");
  const residence = formData.get("residence_reference");

  if (!fullName) return { ok: false, message: "To'liq ism-sharifni kiriting" };
  if (!(passport instanceof File) || passport.size === 0)
    return { ok: false, message: "Pasport rasmini yuklang" };
  if (!(selfie instanceof File) || selfie.size === 0)
    return { ok: false, message: "Shaxsiy rasmni (selfie) yuklang" };
  if (!(residence instanceof File) || residence.size === 0)
    return { ok: false, message: "Yashash joyidan ma'lumotnomani yuklang" };

  const out = new FormData();
  out.append("full_name", fullName);
  out.append("passport_image", passport, passport.name);
  out.append("selfie_image", selfie, selfie.name);
  out.append("residence_reference", residence, residence.name);

  try {
    await KycAPI.submit(out);
    revalidatePath("/app/verification");
    revalidatePath("/app/withdraw");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createWithdrawalAction(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const projectRaw = String(formData.get("project") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const cardNumber = String(formData.get("card_number") ?? "").trim();
  const cardOwner = String(formData.get("card_owner") ?? "").trim();

  if (!amount) return { ok: false, message: "Summani kiriting" };
  if (!cardNumber) return { ok: false, message: "Karta raqamini kiriting" };
  if (!cardOwner) return { ok: false, message: "Karta egasini kiriting" };

  try {
    await WithdrawalAPI.create({
      project: projectRaw ? Number(projectRaw) : null,
      amount,
      card_number: cardNumber,
      card_owner: cardOwner,
    });
    revalidatePath("/app/withdraw");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteWithdrawalAction(id: number | string): Promise<Result> {
  try {
    await WithdrawalAPI.remove(id);
    revalidatePath("/app/withdraw");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
