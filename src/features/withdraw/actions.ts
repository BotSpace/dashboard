"use server";
import { revalidatePath } from "next/cache";
import { KycAPI, WithdrawalAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string };

// DRF xato javoblari ikki qavat envelope ichida keladi:
//   { status:false, data:{ status:false, detail:"ValidationError", errors:{field:[msg]}, codes:{...} } }
// Bu yordamchi ichidagi `errors` lug'atini topib, faqat xabar matnlarini chiqaradi.
function collectMessages(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(collectMessages);
  if (node && typeof node === "object") return Object.values(node as Record<string, unknown>).flatMap(collectMessages);
  return [];
}

function findErrors(node: unknown, depth = 0): unknown {
  if (!node || typeof node !== "object" || depth > 5) return null;
  const obj = node as Record<string, unknown>;
  if (obj.errors && typeof obj.errors === "object") return obj.errors;
  if (obj.data && typeof obj.data === "object") return findErrors(obj.data, depth + 1);
  return null;
}

function fail(e: unknown): Result {
  if (!isApiError(e)) return { ok: false, message: (e as Error).message || "Xatolik yuz berdi" };
  const errors = findErrors(e.details);
  const msgs = collectMessages(errors).filter((m) => m && m !== "ValidationError");
  if (msgs.length) return { ok: false, message: msgs.join("; ") };
  return { ok: false, message: e.message || "Xatolik yuz berdi" };
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
  const amount = String(formData.get("amount") ?? "").trim();
  const cardNumber = String(formData.get("card_number") ?? "").trim();
  const cardOwner = String(formData.get("card_owner") ?? "").trim();

  if (!amount) return { ok: false, message: "Summani kiriting" };
  if (!cardNumber) return { ok: false, message: "Karta raqamini kiriting" };
  if (!cardOwner) return { ok: false, message: "Karta egasini kiriting" };

  try {
    await WithdrawalAPI.create({ amount, card_number: cardNumber, card_owner: cardOwner });
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
