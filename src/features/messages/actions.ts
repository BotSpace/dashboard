"use server";
import { revalidatePath } from "next/cache";
import { MessagesAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export async function sendBroadcastAction({
  projectId,
  caption,
}: {
  projectId: number | string;
  caption: string;
}): Promise<{ ok: boolean; message?: string }> {
  const trimmed = caption.trim();
  if (!trimmed) return { ok: false, message: "Xabar matni bo'sh bo'lmasin" };
  try {
    await MessagesAPI.send({ project: projectId, caption: trimmed });
    revalidatePath(`/app/bots/${projectId}/messages`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Yuborishda xatolik yuz berdi" };
  }
}

export async function sendBroadcastFormAction(
  projectId: number | string,
  formData: FormData,
): Promise<{ ok: boolean; message?: string; data?: unknown }> {
  const caption = (formData.get("caption") as string | null) ?? "";
  const hasMedia =
    formData.has("photo") || formData.has("video");

  if (!caption.trim() && !hasMedia) {
    return { ok: false, message: "Matn yoki media kiriting" };
  }

  // Ensure project field is set
  formData.set("project", String(projectId));

  try {
    const data = await MessagesAPI.sendForm(formData);
    revalidatePath(`/app/bots/${projectId}/messages`);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Yuborishda xatolik yuz berdi" };
  }
}
