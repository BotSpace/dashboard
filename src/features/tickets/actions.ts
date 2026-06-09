"use server";
import { revalidatePath } from "next/cache";
import { TicketsAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

type Result = { ok: boolean; message?: string };

export async function createTicketAction(_prev: Result | undefined, formData: FormData): Promise<Result> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!subject) return { ok: false, message: "Mavzuni kiriting" };
  if (!message) return { ok: false, message: "Xabarni kiriting" };
  try {
    await TicketsAPI.create({ subject, message });
    revalidatePath("/app/tickets");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Xatolik yuz berdi" };
  }
}
