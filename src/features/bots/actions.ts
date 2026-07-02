"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProjectsAPI, ReleasesAPI, EnvAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";
import type { ManagedBot, ManagedBotConfig, Project } from "@/shared/types/api";

export type RunningBot = {
  project_id: number;
  name: string;
  kind: "debug" | "release";
  release_id?: number;
};

// ---------------------------------------------------------------------------
// Managed bot ("Telegram orqali") + launch-status polling — generic
// project/release actions shared by the blank-bot wizard (this feature) and
// the template-create wizard (features/templates). Historically these lived
// only in features/templates/actions.ts; moved here since they don't touch
// anything template-specific, and templates/actions.ts re-exports them so
// existing imports keep working unchanged.
// ---------------------------------------------------------------------------

export async function getManagedBotConfigAction(): Promise<
  { ok: true; data: ManagedBotConfig } | { ok: false; message: string }
> {
  try {
    const data = await ProjectsAPI.managedBotConfig();
    return { ok: true, data };
  } catch (e) {
    if (isApiError(e)) return { ok: false, message: e.message };
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}

export async function listManagedBotsAction(): Promise<
  { ok: true; data: ManagedBot[] } | { ok: false; message: string }
> {
  try {
    const data = await ProjectsAPI.listManagedBots();
    return { ok: true, data };
  } catch (e) {
    if (isApiError(e)) return { ok: false, message: e.message };
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }
}

export async function claimManagedBotAction(username: string): Promise<void> {
  try {
    await ProjectsAPI.claimManagedBot(username);
  } catch {
    // claim best-effort — muvaffaqiyatsiz bo'lsa Telegram matching zaxira ishlaydi
  }
}

// Bot ni ishga tushirish holati — StepLaunch pollingi shu qiymatlarni kutadi.
export type BotLaunchStatus = "running" | "pending" | "failed" | "none";

export type BotLaunchStatusResult =
  | { ok: true; status: BotLaunchStatus; project?: Project }
  | { ok: false; status: "none"; message: string };

// Post-create polling for the wizards' "Ishga tushirish" step. Reuses the same
// endpoints the bots list/detail pages already use to read release/debug
// status (ReleasesAPI.list — see releases/page.tsx) plus a fresh project
// fetch, since bot_username/bot_link may only be resolved once the
// debug/release container actually comes up.
export async function getBotLaunchStatusAction(
  projectId: number | string
): Promise<BotLaunchStatusResult> {
  try {
    const [project, releases] = await Promise.all([
      ProjectsAPI.get(projectId).catch(() => undefined),
      ReleasesAPI.list(projectId).catch(() => []),
    ]);

    // Debug (tokenless) mode never creates a Release row — the container's
    // own lifecycle lives on project.debug.status instead (see RetrieveProjectSerializer
    // → RetrieveDebugSerializer). Combine both sources so debug-mode bots
    // (managed-bot AND "Tokensiz sinov") are detected as running too, not just
    // release-mode ones.
    const debugStatus = project?.debug?.status;
    const releaseRunning = releases.some((r) => r.status === "running");
    const releaseFailed = releases.some((r) => r.status === "failed");

    let status: BotLaunchStatus = "none";
    if (releaseRunning || debugStatus === "running") {
      status = "running";
    } else if (releaseFailed || debugStatus === "failed") {
      status = "failed";
    } else if (releases.length > 0 || debugStatus === "initializing" || debugStatus === "pending") {
      status = "pending";
    }

    return { ok: true, status, project };
  } catch (e) {
    return {
      ok: false,
      status: "none",
      message: isApiError(e) ? e.message : "Server bilan bog'lanib bo'lmadi",
    };
  }
}

// ---------------------------------------------------------------------------
// Blank-bot wizard submit (src/app/[locale]/(app)/app/bots/new)
// ---------------------------------------------------------------------------

export type CreateBlankBotBody = {
  name: string;
  description?: string;
  token?: string;
  managed_bot_id?: number;
  mode?: "debug";
};

export type CreateBlankBotResult =
  | { ok: true; project: Project; noConnect: boolean }
  | { ok: false; message: string };

// Creates a plain (non-template) project and — unlike the flat legacy
// createBotAction — also attempts to bring the bot online right away so the
// wizard's "Ishga tushirish" step has something to poll, mirroring the
// template-create wizard's UX.
//
// KNOWN BACKEND GAP: `/api/project/` (ProjectsAPI.create) is not documented to
// accept `managed_bot_id` / `mode` — those are currently only wired into
// `/api/project/create-from-template/`. We pass them through opportunistically
// (best-effort, ignored if unsupported) and then try to deploy a release; if
// that fails with `bot_token_required` the project simply has no token yet
// (managed-bot linking didn't take, or "Tokensiz sinov" was chosen and the
// backend has no template-less debug mode). In that case we return
// `noConnect: true` so the UI can show a "connect a token on the project page"
// note instead of polling forever.
export async function createBlankBotAction(
  body: CreateBlankBotBody
): Promise<CreateBlankBotResult> {
  let project: Project;
  try {
    project = await ProjectsAPI.create({
      name: body.name,
      description: body.description,
      ...(body.token ? { token: body.token } : {}),
      // Not part of the typed Project shape (see gap note above) — passed
      // opportunistically in case the base endpoint's serializer accepts it.
      ...(body.managed_bot_id ? { managed_bot_id: body.managed_bot_id } : {}),
      ...(body.mode ? { mode: body.mode } : {}),
    } as Partial<Project>);
  } catch (e) {
    if (isApiError(e)) {
      const details = e.details as { detail?: string; name?: string[]; token?: string[] } | undefined;
      const msg =
        details?.detail ??
        (Array.isArray(details?.name) ? details.name[0] : undefined) ??
        (Array.isArray(details?.token) ? details.token[0] : undefined) ??
        e.message;
      return { ok: false, message: msg };
    }
    return { ok: false, message: "Server bilan bog'lanib bo'lmadi" };
  }

  // Project created — now try to bring it online (mirrors DeployButton).
  let noConnect = false;
  try {
    await ReleasesAPI.create(project.id);
  } catch (e) {
    if (isApiError(e) && e.status === 400) {
      const raw = e.details as Record<string, unknown> | null;
      const code = raw?.code ?? (raw?.data as Record<string, unknown> | undefined)?.code;
      if (code === "bot_token_required") {
        noConnect = true;
      }
    }
    // Other deploy errors (e.g. running_bot_limit) are swallowed here — the
    // project still exists, the launch step will time out and the user can
    // manage it from the project page like any other bot.
  }

  revalidatePath("/app/bots");
  return { ok: true, project, noConnect };
}

export type DeployResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; limit?: number; running?: RunningBot[] };

export type SetBotTokenResult =
  | { ok: true; username: string }
  | { ok: false; message: string };

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
// envelope ({"status": false, "data": {code, limit, running, detail}}) and the
// bot_token_required 400 ({"detail": "...", "code": "bot_token_required"}).
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
  if (isApiError(e) && e.status === 400) {
    const raw = e.details as Record<string, unknown> | null;
    const code = raw?.code ?? (raw?.data as Record<string, unknown> | undefined)?.code;
    if (code === "bot_token_required") {
      return {
        ok: false,
        message: String(raw?.detail ?? "Bot token required"),
        code: "bot_token_required",
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

export async function setBotTokenAction(
  projectId: string | number,
  token: string,
): Promise<SetBotTokenResult> {
  try {
    const res = await ProjectsAPI.setBotToken(projectId, token);
    revalidatePath(`/app/bots/${projectId}`);
    return { ok: true, username: res.username };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Token saqlashda xatolik" };
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
