"use server";
import { revalidatePath } from "next/cache";
import { api } from "@/shared/api/server";
import { readSession, setSessionCookie } from "@/shared/auth/session";
import { isApiError } from "@/shared/api/client";

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  try {
    await api("/api/auth/user-update/", {
      method: "PATCH",
      json: { first_name, last_name, email },
    });
    const session = await readSession();
    if (session) {
      await setSessionCookie({
        ...session,
        user: { ...session.user, first_name, last_name, email },
      });
    }
    revalidatePath("/app/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Saqlashda xatolik" };
  }
}

export async function changePasswordAction(_prev: unknown, formData: FormData) {
  const oldPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) return { ok: false, message: "Parol kamida 8 ta belgi" };
  try {
    await api("/api/auth/change-password/", {
      method: "POST",
      json: { old_password: oldPassword, new_password: newPassword },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Parol o'zgartirishda xatolik" };
  }
}
