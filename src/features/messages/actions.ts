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
