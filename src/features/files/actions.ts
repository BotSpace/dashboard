"use server";
import { revalidatePath } from "next/cache";
import { FilesAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";
import type { FileItem } from "@/shared/types/api";

export type FilesResult =
  | { ok: true; data: FileItem }
  | { ok: false; message: string };

function fail(e: unknown): { ok: false; message: string } {
  if (isApiError(e)) {
    const details = e.details as { errors?: Record<string, string>; detail?: string } | undefined;
    if (details?.errors) {
      const flat = Object.entries(details.errors)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      return { ok: false, message: flat || e.message };
    }
    return { ok: false, message: details?.detail || e.message };
  }
  return { ok: false, message: (e as Error).message || "Yuklashda xatolik" };
}

export async function uploadFileAction(formData: FormData): Promise<FilesResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Fayl topilmadi" };
  if (file.size === 0) return { ok: false, message: "Bo'sh fayl" };

  const project = formData.get("project");
  const ttl = formData.get("ttl");
  const out = new FormData();
  out.append("file", file, file.name);
  if (project && String(project)) out.append("project", String(project));
  if (ttl && Number(ttl) > 0) out.append("ttl", String(ttl));

  try {
    const data = await FilesAPI.upload(out);
    if (project) {
      revalidatePath(`/app/bots/${project}/files`);
    } else {
      revalidatePath("/app/files");
    }
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteFileAction(args: {
  id: string | number;
  project?: string | number;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await FilesAPI.remove(args.id);
    if (args.project) {
      revalidatePath(`/app/bots/${args.project}/files`);
    } else {
      revalidatePath("/app/files");
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
