import "server-only";
import { api } from "./server";
import type {
  Project,
  Release,
  EnvVar,
  Plan,
  Subscription,
  SubscriptionUsage,
  FileItem,
  CmsAuditEntry,
  CmsCollection,
  CmsDocument,
  CmsDocumentListResponse,
  CmsField,
  Template,
  TemplateCategory,
  TemplateFeature,
  Ticket,
  Transaction,
  BroadcastMessage,
} from "@/shared/types/api";

// Backend response shape: { status, data: { results: T[], total_items, ... } }  OR  { results: T[] }  OR plain array
type ListEnvelope<T> = {
  status?: boolean;
  data?: {
    results?: T[];
    total_items?: number;
    total_pages?: number;
    page_size?: number;
    current_page?: number;
    links?: { previous: string | null; next: string | null };
  };
  results?: T[];
};
type ItemEnvelope<T> = { status?: boolean; data?: T } | T;

function unwrapList<T>(d: unknown): T[] {
  if (Array.isArray(d)) return d as T[];
  if (!d || typeof d !== "object") return [];
  const e = d as ListEnvelope<T>;
  if (Array.isArray(e.data?.results)) return e.data!.results as T[];
  if (Array.isArray(e.results)) return e.results as T[];
  return [];
}

function unwrapItem<T>(d: unknown): T {
  if (!d || typeof d !== "object") return d as T;
  const e = d as { status?: boolean; data?: T };
  if (e.data !== undefined && (typeof e.data === "object" || typeof e.data === "number" || typeof e.data === "string")) {
    return e.data as T;
  }
  return d as T;
}

// PROJECTS — admin-panel ham `/api/project/`
export const ProjectsAPI = {
  list: async (search?: string) => {
    const d = await api<unknown>("/api/project/", { query: { search } });
    return unwrapList<Project>(d);
  },
  get: async (id: string | number) => unwrapItem<Project>(await api<unknown>(`/api/project/${id}/`)),
  create: (body: Partial<Project>) =>
    api<Project>("/api/project/", { method: "POST", json: body }).then(unwrapItem<Project>),
  update: (id: string | number, body: Partial<Project>) =>
    api<Project>(`/api/project/${id}/`, { method: "PATCH", json: body }).then(unwrapItem<Project>),
  remove: (id: string | number) => api<void>(`/api/project/${id}/`, { method: "DELETE" }),
};

// RELEASES
export const ReleasesAPI = {
  list: async (project: string | number) => {
    const d = await api<unknown>("/api/relase/", { query: { project } });
    return unwrapList<Release>(d);
  },
  create: (project: string | number) =>
    api<Release>("/api/relase/", { method: "POST", json: { project } }).then(unwrapItem<Release>),
};

// ENV VARS
export const EnvAPI = {
  list: async (project: string | number) => {
    const d = await api<unknown>("/api/enviroment/", { query: { project } });
    return unwrapList<EnvVar>(d);
  },
  create: (body: Omit<EnvVar, "id">) =>
    api<EnvVar>("/api/enviroment/", { method: "POST", json: body }),
  remove: (id: string | number) => api<void>(`/api/enviroment/${id}/`, { method: "DELETE" }),
};

// PLANS — public, no auth needed
export const PlansAPI = {
  list: async () => {
    const d = await api<unknown>("/api/plans/");
    return unwrapList<Plan>(d);
  },
  current: (project: string | number) =>
    api<Plan>(`/api/project/${project}/plan/`).then(unwrapItem<Plan>),
};

// SUBSCRIPTION — per-user global plan
export const SubscriptionAPI = {
  current: async () => {
    const d = await api<unknown>("/api/subscription/");
    return unwrapItem<Subscription>(d);
  },
  usage: async () => {
    const d = await api<unknown>("/api/subscription/usage/");
    return unwrapItem<SubscriptionUsage>(d);
  },
  upgrade: (planId: number | string, months = 1) =>
    api<unknown>("/api/subscription/upgrade/", {
      method: "POST",
      json: { plan_id: planId, months },
    }).then(unwrapItem),
};

// FILES
export const FilesAPI = {
  list: async (project?: string | number) => {
    const d = await api<unknown>("/api/file/", { query: { project } });
    return unwrapList<FileItem>(d);
  },
  upload: async (body: FormData) => {
    const d = await api<unknown>("/api/file/", { method: "POST", body });
    return unwrapItem<FileItem>(d);
  },
  remove: (id: string | number) => api<void>(`/api/file/${id}/`, { method: "DELETE" }),
};

// TEMPLATES
export type TemplateListParams = {
  search?: string;
  categories?: string | number;
  features?: string | number;
  price_min?: number | string;
  price_max?: number | string;
};

export const TemplatesAPI = {
  list: async (params: TemplateListParams = {}) => {
    const d = await api<unknown>("/api/template/list/", { query: params });
    return unwrapList<Template>(d);
  },
  get: (slug: string) =>
    api<Template>(`/api/template/list/${slug}/`).then(unwrapItem<Template>),
  categories: async () => {
    const d = await api<unknown>("/api/template/category/");
    return unwrapList<TemplateCategory>(d);
  },
  features: async () => {
    const d = await api<unknown>("/api/template/feature/");
    return unwrapList<TemplateFeature>(d);
  },
  order: (templateId: string | number) =>
    api("/api/template/order/", { method: "POST", json: { template: templateId } }),
};

// TICKETS
export const TicketsAPI = {
  list: async () => {
    const d = await api<unknown>("/api/ticket/");
    return unwrapList<Ticket>(d);
  },
  get: (id: string | number) => api<Ticket>(`/api/ticket/${id}/`).then(unwrapItem<Ticket>),
  create: (body: Pick<Ticket, "subject" | "message">) =>
    api<Ticket>("/api/ticket/", { method: "POST", json: body }),
};

// BILLING
export const BillingAPI = {
  history: async () => {
    const d = await api<unknown>("/api/history/");
    return unwrapList<Transaction>(d);
  },
  transactions: async () => {
    const d = await api<unknown>("/api/transaction/");
    return unwrapList<Transaction>(d);
  },
  balance: async () => {
    const d = await api<unknown>("/api/user/balance/");
    return unwrapItem<{ balance: number; template_balance?: number; currency?: string }>(d);
  },
};

// MESSAGES (broadcast)
export const MessagesAPI = {
  list: async (project?: string | number) => {
    const d = await api<unknown>("/api/message/", { query: { project } });
    return unwrapList<BroadcastMessage>(d);
  },
  create: (body: Omit<BroadcastMessage, "id">) =>
    api<BroadcastMessage>("/api/message/", { method: "POST", json: body }),
  remove: (id: string | number) => api<void>(`/api/message/${id}/`, { method: "DELETE" }),
};

// CMSv2 — Django + MongoDB hybrid
function cms(projectId: string | number, ...parts: (string | number)[]): string {
  return `/api/cms/projects/${projectId}/collections/${parts.map(encodeURIComponent).join("/")}`;
}

export const CmsAPI = {
  listCollections: async (projectId: string | number): Promise<CmsCollection[]> => {
    const d = await api<unknown>(cms(projectId) + "/");
    return Array.isArray(d) ? (d as CmsCollection[]) : unwrapList<CmsCollection>(d);
  },
  getCollection: (projectId: string | number, name: string): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId, name) + "/").then(unwrapItem<CmsCollection>),
  createCollection: (
    projectId: string | number,
    body: { name: string; label?: string; description?: string; fields?: CmsField[] }
  ): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId) + "/", { method: "POST", json: body }).then(
      unwrapItem<CmsCollection>
    ),
  deleteCollection: (projectId: string | number, name: string): Promise<void> =>
    api<void>(cms(projectId, name) + "/", { method: "DELETE" }),
  addField: (projectId: string | number, name: string, field: CmsField): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields") + "/", { method: "POST", json: field }),
  updateField: (
    projectId: string | number,
    name: string,
    fieldName: string,
    patch: Partial<CmsField>
  ): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields", fieldName) + "/", {
      method: "PATCH",
      json: patch,
    }),
  removeField: (projectId: string | number, name: string, fieldName: string): Promise<void> =>
    api<void>(cms(projectId, name, "fields", fieldName) + "/", { method: "DELETE" }),

  // Documents
  listDocuments: (
    projectId: string | number,
    name: string,
    params: { filter?: Record<string, unknown>; sort?: string; limit?: number; skip?: number } = {}
  ): Promise<CmsDocumentListResponse> => {
    const query: Record<string, string | number | undefined> = {
      limit: params.limit ?? 50,
      skip: params.skip ?? 0,
    };
    if (params.filter && Object.keys(params.filter).length > 0) {
      query.filter = JSON.stringify(params.filter);
    }
    if (params.sort) query.sort = params.sort;
    return api<CmsDocumentListResponse>(cms(projectId, name, "documents") + "/", { query });
  },
  getDocument: (
    projectId: string | number,
    name: string,
    id: string
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents", id) + "/"),
  insertDocument: (
    projectId: string | number,
    name: string,
    document: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents") + "/", {
      method: "POST",
      json: document,
    }),
  bulkInsert: (
    projectId: string | number,
    name: string,
    documents: Record<string, unknown>[]
  ): Promise<{ inserted_ids: string[]; count: number }> =>
    api(cms(projectId, name, "documents", "bulk") + "/", {
      method: "POST",
      json: { documents },
    }),
  updateDocument: (
    projectId: string | number,
    name: string,
    id: string,
    patch: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents", id) + "/", {
      method: "PATCH",
      json: patch,
    }),
  deleteDocument: (projectId: string | number, name: string, id: string): Promise<void> =>
    api<void>(cms(projectId, name, "documents", id) + "/", { method: "DELETE" }),
  restoreDocument: (projectId: string | number, name: string, id: string): Promise<unknown> =>
    api(cms(projectId, name, "documents", id, "restore") + "/", { method: "POST" }),
  aggregate: (
    projectId: string | number,
    name: string,
    pipeline: Record<string, unknown>[],
    limit = 500
  ): Promise<{ results: CmsDocument[]; count: number }> =>
    api(cms(projectId, name, "documents", "aggregate") + "/", {
      method: "POST",
      json: { pipeline, limit },
    }),
  audit: async (
    projectId: string | number,
    name: string,
    params: { action?: string; document_id?: string } = {}
  ): Promise<CmsAuditEntry[]> => {
    const d = await api<unknown>(cms(projectId, name, "audit") + "/", { query: params });
    return Array.isArray(d) ? (d as CmsAuditEntry[]) : unwrapList<CmsAuditEntry>(d);
  },
};

// API TOKENS
export const APITokensAPI = {
  list: async () => {
    const d = await api<unknown>("/auth/api-tokens/");
    return unwrapList<{ id: number; name: string; prefix: string; last_used_at: string | null; created_at: string }>(d);
  },
  create: async (name: string) => {
    const d = await api<unknown>("/auth/api-tokens/", { method: "POST", json: { name } });
    return unwrapItem<{ id: number; name: string; token: string; prefix: string }>(d);
  },
  remove: (id: number | string) => api<void>(`/auth/api-tokens/${id}/`, { method: "DELETE" }),
};

// AUTH (profile)
export const AuthAPI = {
  me: async () => unwrapItem<{ id: number | string; name?: string; email?: string; phone?: string; avatar?: string }>(
    await api<unknown>("/auth/me/")
  ),
  updateProfile: (body: { name?: string; email?: string }) =>
    api("/api/auth/user-update/", { method: "PATCH", json: body }),
  changePassword: (body: { old_password: string; new_password: string }) =>
    api("/api/auth/change-password/", { method: "POST", json: body }),
};
