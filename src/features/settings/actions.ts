"use server";
import { revalidatePath } from "next/cache";
import { AuthAPI } from "@/shared/api/services";
import { readSession, setSessionCookie } from "@/shared/auth/session";
import { isApiError } from "@/shared/api/client";

export async function updateProfileAction(_prev: unknown, formData: FormData) {
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  try {
    // internal/modules/user routes.go: PATCH /users/me (h.UpdateMe) — the old
    // Django path "/api/auth/user-update/" 404s against the Go backend.
    await AuthAPI.updateProfile({ first_name, last_name, email });
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
    // internal/modules/user routes.go: POST /users/me/password — same wrong-path
    // class of bug as the profile update above (old Django "/api/auth/change-password/").
    await AuthAPI.changePassword({ old_password: oldPassword, new_password: newPassword });
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Parol o'zgartirishda xatolik" };
  }
}
