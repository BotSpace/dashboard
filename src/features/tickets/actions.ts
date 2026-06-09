"use server";
import { revalidatePath } from "next/cache";
import { TicketsAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string };

export async function replyTicketAction(
  id: string | number,
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const message = String(formData.get("message") ?? "").trim();
  const file = formData.get("attachment");
  if (!message) return { ok: false, message: "Xabarni kiriting" };

  const out = new FormData();
  out.append("message", message);
  if (file instanceof File && file.size > 0) out.append("attachment", file, file.name);

  try {
    await TicketsAPI.reply(id, out);
    revalidatePath(`/app/tickets/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}

export async function createTicketAction(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const file = formData.get("attachment");
  if (!subject) return { ok: false, message: "Mavzuni kiriting" };
  if (!message) return { ok: false, message: "Xabarni kiriting" };

  const out = new FormData();
  out.append("subject", subject);
  out.append("message", message);
  if (file instanceof File && file.size > 0) {
    out.append("attachment", file, file.name);
  }

  try {
    await TicketsAPI.create(out);
    revalidatePath("/app/tickets");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
