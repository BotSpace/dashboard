"use server";
import { CmsAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";
import type {
  CmsDocument,
  CmsDocumentListResponse,
  CmsDocumentCursorResponse,
  CmsField,
} from "@/shared/types/api";

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

export async function listRelationOptionsAction(args: {
  projectId: string | number;
  name: string;
  cursor?: string | null;
  search?: string;
  limit?: number;
}): Promise<{ ok: true; data: CmsDocumentCursorResponse } | { ok: false; message: string }> {
  try {
    const data = await CmsAPI.listDocumentsCursor(args.projectId, args.name, {
      cursor: args.cursor,
      search: args.search,
      limit: args.limit,
    });
    return { ok: true, data };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message ?? "Error" };
  }
}

export async function getDocumentAction(args: {
  projectId: string | number;
  name: string;
  id: string;
}): Promise<{ ok: true; data: CmsDocument } | { ok: false; message: string }> {
  try {
    const data = await CmsAPI.getDocument(args.projectId, args.name, args.id);
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
    const d = await CmsAPI.restoreDocument();
    return { ok: true, data: d };
  } catch (e) {
    return fail(e);
  }
}

export async function bulkInsertDocumentsAction(args: {
  projectId: string | number;
  name: string;
  documents: Record<string, unknown>[];
}): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  try {
    const result = await CmsAPI.bulkInsert(args.projectId, args.name, args.documents);
    return { ok: true, count: result.count };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message ?? "Bulk insert xato" };
  }
}

export async function listAllDocumentsAction(args: {
  projectId: string | number;
  name: string;
  maxDocs?: number;
}): Promise<{ ok: true; data: import("@/shared/types/api").CmsDocument[]; total: number } | { ok: false; message: string }> {
  const max = args.maxDocs ?? 500;
  const batchSize = 100;
  try {
    const first = await CmsAPI.listDocuments(args.projectId, args.name, {
      limit: batchSize,
      skip: 0,
      sort: "-_created_at",
    });
    const total = first.total;
    const all = [...first.results];
    const batches = Math.ceil(Math.min(total, max) / batchSize);
    for (let i = 1; i < batches; i++) {
      const batch = await CmsAPI.listDocuments(args.projectId, args.name, {
        limit: batchSize,
        skip: i * batchSize,
        sort: "-_created_at",
      });
      all.push(...batch.results);
      if (all.length >= max) break;
    }
    return { ok: true, data: all.slice(0, max), total };
  } catch (e) {
    const r = fail(e);
    return { ok: false, message: r.message ?? "Error" };
  }
}
