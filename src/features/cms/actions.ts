"use server";
import { CmsAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";
import type { CmsDocumentListResponse, CmsField } from "@/shared/types/api";

export type CmsResult = { ok: boolean; message?: string; data?: unknown };

function fail(e: unknown): CmsResult {
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
  return { ok: false, message: (e as Error).message || "Xatolik" };
}

export async function listDocumentsAction(args: {
  projectId: string | number;
  name: string;
  filter?: Record<string, unknown>;
  sort?: string;
  limit?: number;
  skip?: number;
}): Promise<{ ok: true; data: CmsDocumentListResponse } | { ok: false; message: string }> {
  try {
    const data = await CmsAPI.listDocuments(args.projectId, args.name, {
      filter: args.filter,
      sort: args.sort,
      limit: args.limit,
      skip: args.skip,
    });
    return { ok: true, data };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message ?? "Error" };
  }
}

export async function createCollectionAction(args: {
  projectId: string | number;
  name: string;
  label?: string;
  description?: string;
  primary_field?: string;
  fields?: CmsField[];
}): Promise<CmsResult> {
  try {
    const col = await CmsAPI.createCollection(args.projectId, {
      name: args.name,
      label: args.label,
      description: args.description,
      primary_field: args.primary_field,
      fields: args.fields,
    });
    return { ok: true, data: col };
  } catch (e) {
    return fail(e);
  }
}

export async function updateCollectionAction(args: {
  projectId: string | number;
  name: string;
  patch: { label?: string; description?: string; primary_field?: string };
}): Promise<CmsResult> {
  try {
    const col = await CmsAPI.updateCollection(args.projectId, args.name, args.patch);
    return { ok: true, data: col };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCollectionAction(args: {
  projectId: string | number;
  name: string;
}): Promise<CmsResult> {
  try {
    await CmsAPI.deleteCollection(args.projectId, args.name);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function addFieldAction(args: {
  projectId: string | number;
  name: string;
  field: CmsField;
}): Promise<CmsResult> {
  try {
    const f = await CmsAPI.addField(args.projectId, args.name, args.field);
    return { ok: true, data: f };
  } catch (e) {
    return fail(e);
  }
}

export async function updateFieldAction(args: {
  projectId: string | number;
  name: string;
  fieldName: string;
  patch: Partial<CmsField>;
}): Promise<CmsResult> {
  try {
    const f = await CmsAPI.updateField(args.projectId, args.name, args.fieldName, args.patch);
    return { ok: true, data: f };
  } catch (e) {
    return fail(e);
  }
}

export async function removeFieldAction(args: {
  projectId: string | number;
  name: string;
  fieldName: string;
}): Promise<CmsResult> {
  try {
    await CmsAPI.removeField(args.projectId, args.name, args.fieldName);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function insertDocumentAction(args: {
  projectId: string | number;
  name: string;
  document: Record<string, unknown>;
}): Promise<CmsResult> {
  try {
    const d = await CmsAPI.insertDocument(args.projectId, args.name, args.document);
    return { ok: true, data: d };
  } catch (e) {
    return fail(e);
  }
}

export async function updateDocumentAction(args: {
  projectId: string | number;
  name: string;
  id: string;
  patch: Record<string, unknown>;
}): Promise<CmsResult> {
  try {
    const d = await CmsAPI.updateDocument(args.projectId, args.name, args.id, args.patch);
    return { ok: true, data: d };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDocumentAction(args: {
  projectId: string | number;
  name: string;
  id: string;
}): Promise<CmsResult> {
  try {
    await CmsAPI.deleteDocument(args.projectId, args.name, args.id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function restoreDocumentAction(args: {
  projectId: string | number;
  name: string;
  id: string;
}): Promise<CmsResult> {
  try {
    const d = await CmsAPI.restoreDocument(args.projectId, args.name, args.id);
    return { ok: true, data: d };
  } catch (e) {
    return fail(e);
  }
}
