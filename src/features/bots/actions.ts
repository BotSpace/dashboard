"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProjectsAPI, ReleasesAPI, EnvAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type RunningBot = {
  project_id: number;
  name: string;
  kind: "debug" | "release";
  release_id?: number;
};

export type DeployResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; limit?: number; running?: RunningBot[] };

export async function createBotAction(_prev: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const locale = String(formData.get("locale") ?? "uz");
  if (!name) return { ok: false, message: "Bot nomini kiriting" };
  try {
    const project = await ProjectsAPI.create({ name, description, token: token || undefined });
    revalidatePath("/app/bots");
    redirect(`/${locale}/app/bots/${project.uuid ?? project.id}`);
  } catch (e) {
    if (isApiError(e)) return { ok: false, message: e.message };
    throw e;
  }
}

export async function updateBotAction(id: string | number, _prev: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  try {
    await ProjectsAPI.update(id, { name, description, token: token || undefined });
    revalidatePath(`/app/bots/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Saqlashda xatolik" };
  }
}

export async function renameBotAction(id: string | number, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, message: "Nom bo'sh bo'lmasin" };
  try {
    await ProjectsAPI.update(id, { name: trimmed });
    revalidatePath(`/app/bots/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Saqlashda xatolik" };
  }
}

export async function deleteBotAction(id: string | number, locale: string) {
  await ProjectsAPI.remove(id);
  revalidatePath("/app/bots");
  redirect(`/${locale}/app/bots`);
}

export async function deployReleaseAction(projectId: string | number): Promise<DeployResult> {
  try {
    await ReleasesAPI.create(projectId);
    revalidatePath(`/app/bots/${projectId}/releases`);
    return { ok: true };
  } catch (e) {
    return toDeployError(e, "Deploy muvaffaqiyatsiz");
  }
}

// Maps a deploy/rollback error to a DeployResult, surfacing the running-bot-limit
// envelope ({"status": false, "data": {code, limit, running, detail}}).
function toDeployError(e: unknown, fallback: string): DeployResult {
  if (isApiError(e) && e.status === 409) {
    const raw = e.details as Record<string, unknown> | null;
    const d = (raw && typeof raw.data === "object" && raw.data !== null
      ? (raw.data as Record<string, unknown>)
      : raw) as Record<string, unknown> | null;
    if (d && d.code === "running_bot_limit") {
      return {
        ok: false,
        message: String(d.detail ?? "Running bot limit reached"),
        code: "running_bot_limit",
        limit: typeof d.limit === "number" ? d.limit : undefined,
        running: Array.isArray(d.running) ? (d.running as RunningBot[]) : [],
      };
    }
  }
  return { ok: false, message: isApiError(e) ? e.message : fallback };
}

// Re-deploys an older release's saved flow snapshot as a NEW release and
// restores it as the project's draft. projectId is only used for revalidation.
export async function rollbackReleaseAction(
  projectId: string | number,
  releaseId: string | number,
): Promise<DeployResult> {
  try {
    await ReleasesAPI.rollback(releaseId);
    revalidatePath(`/app/bots/${projectId}/releases`);
    return { ok: true };
  } catch (e) {
    return toDeployError(e, "Qaytarish muvaffaqiyatsiz");
  }
}

export async function stopDebugAction(projectId: number): Promise<{ ok: boolean; message?: string }> {
  try {
    await ProjectsAPI.stopDebug(projectId);
    revalidatePath(`/app/bots/${projectId}/releases`);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "To'xtatishda xatolik" };
  }
}

export async function stopReleaseAction(releaseId: number): Promise<{ ok: boolean; message?: string }> {
  try {
    await ReleasesAPI.stop(releaseId);
    revalidatePath("/app/bots");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "To'xtatishda xatolik" };
  }
}

export async function addEnvAction(_prev: unknown, formData: FormData) {
  const project = String(formData.get("project") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "");
  if (!project || !key) return { ok: false, message: "Key bo'sh bo'lmasin" };
  await EnvAPI.create({ project, key, value });
  revalidatePath(`/app/bots/${project}/env`);
  return { ok: true };
}

export async function removeEnvAction(id: string | number, projectId: string | number) {
  await EnvAPI.remove(id);
  revalidatePath(`/app/bots/${projectId}/env`);
  return { ok: true };
}
