"use server";
import { isApiError } from "@/shared/api/client";
import { TemplatesAPI, type TemplateListParams, type PaginatedTemplates } from "@/shared/api/services";

export type OrderResult = { ok: boolean; message?: string };

export async function loadMoreTemplatesAction(
  params: TemplateListParams
): Promise<PaginatedTemplates> {
  try {
    return await TemplatesAPI.listPaginated(params);
  } catch {
    return { items: [], page: Number(params.page) || 1, totalPages: 1, hasMore: false };
  }
}

export async function orderTemplateAction(templateId: number | string): Promise<OrderResult> {
  try {
    await TemplatesAPI.order(templateId);
    return { ok: true };
  } catch (e) {
    if (isApiError(e)) {
      const details = e.details as { detail?: string; message?: string } | undefined;
      return { ok: false, message: details?.detail ?? details?.message ?? e.message };
    }
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}
