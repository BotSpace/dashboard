"use server";
import { isApiError } from "@/shared/api/client";
import { TemplatesAPI, ProjectsAPI, type TemplateListParams, type PaginatedTemplates } from "@/shared/api/services";

export type OrderResult = { ok: boolean; message?: string };

export type CreateFromTemplateResult = {
  ok: boolean;
  project_id?: number | string;
  message?: string;
};

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
  // Retry once: the very first click after a fresh session sometimes
  // hits a transient 401 because the bearer arrives before the cookie
  // refresh has fully landed in the action's request context. The
  // backend POST is idempotent (returns the existing order on second
  // call), so a single retry is safe.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await TemplatesAPI.order(templateId);
      return { ok: true };
    } catch (e) {
      const isLast = attempt === 1;
      if (!isLast && isApiError(e) && (e.status === 401 || e.status >= 500)) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      if (isApiError(e)) {
        const details = e.details as { detail?: string; message?: string } | undefined;
        return { ok: false, message: details?.detail ?? details?.message ?? e.message };
      }
      return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
    }
  }
  return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
}

export async function createProjectFromTemplateAction(
  body: { template: number | string; name: string; token: string; envs?: Record<string, string> }
): Promise<CreateFromTemplateResult> {
  try {
    const project = await ProjectsAPI.createFromTemplate(body);
    return { ok: true, project_id: project.id };
  } catch (e) {
    if (isApiError(e)) {
      const details = e.details as
        | {
            detail?: string;
            template?: string[] | string;
            name?: string[];
            token?: string[];
            message?: string;
            envs?: Record<string, string[]> | string;
          }
        | undefined;
      let msg: string | undefined;
      if (typeof details?.detail === "string") msg = details.detail;
      else if (typeof details?.template === "string") msg = details.template;
      else if (Array.isArray(details?.template)) msg = details.template[0];
      else if (Array.isArray(details?.name)) msg = details.name[0];
      else if (Array.isArray(details?.token)) msg = details.token[0];
      else if (typeof details?.envs === "string") msg = details.envs;
      else if (details?.envs && typeof details.envs === "object") {
        const envErrors = Object.entries(details.envs as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join("; ");
        msg = envErrors || undefined;
      } else if (typeof details?.message === "string") msg = details.message;
      return { ok: false, message: msg ?? e.message };
    }
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}
