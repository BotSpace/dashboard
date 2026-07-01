import "server-only";
import { api } from "./server";
import type {
  Project,
  ProjectMonitoring,
  ProjectMonitoringHistory,
  MonitoringRange,
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
  CmsDocumentCursorResponse,
  CmsField,
  Template,
  TemplateCategory,
  TemplateFeature,
  TemplateRequirements,
  Ticket,
  Transaction,
  BroadcastMessage,
  DashboardOverview,
  EarningsSummary,
  EarningsOrder,
  WithdrawalRequest,
  KycStatusResponse,
  KycVerification,
  BlogPost,
  BlogPostListItem,
  Credential,
  CredentialType,
  CredentialListResponse,
  ManagedBot,
  ManagedBotConfig,
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
  if (Array.isArray(e.data)) return e.data as unknown as T[];
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

// Credential responses carry their OWN `data` field (the masked field values), so the
// generic unwrapItem would mistake it for the {status, data} envelope and return the inner
// masked dict. Unwrap only when the payload isn't already a credential (has id/type_key).
function unwrapCredential(d: unknown): Credential {
  if (!d || typeof d !== "object") return d as Credential;
  const e = d as { status?: boolean; data?: unknown; id?: unknown; type_key?: unknown };
  if (e.id !== undefined || e.type_key !== undefined) return e as Credential;
  if (e.data && typeof e.data === "object") return e.data as Credential;
  return d as Credential;
}

export type PaginatedResult<T> = {
  results: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

function unwrapPaginated<T>(d: unknown): PaginatedResult<T> {
  const results = unwrapList<T>(d);
  if (d && typeof d === "object") {
    type P = { total_items?: number; total_pages?: number; current_page?: number; page_size?: number };
    const root = d as { data?: P } & P;
    const src: P = root.data ?? root;
    return {
      results,
      total_items: Number(src.total_items) || results.length,
      total_pages: Number(src.total_pages) || 1,
      current_page: Number(src.current_page) || 1,
      page_size: Number(src.page_size) || results.length,
    };
  }
  return { results, total_items: results.length, total_pages: 1, current_page: 1, page_size: results.length };
}

// PROJECTS — admin-panel ham `/api/project/`
export const ProjectsAPI = {
  setBotToken: async (
    projectId: string | number,
    token: string,
  ): Promise<{ detail: string; username: string }> => {
    const d = await api<unknown>(`/api/v1/project/${projectId}/set-bot-token/`, {
      method: "POST",
      json: { token },
    });
    return unwrapItem<{ detail: string; username: string }>(d);
  },
  list: async (search?: string) => {
    const d = await api<unknown>("/api/project/", { query: { search } });
    return unwrapList<Project>(d);
  },
  listPaged: async (params: { search?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResult<Project>> => {
    const d = await api<unknown>("/api/project/", { query: params });
    return unwrapPaginated<Project>(d);
  },
  get: async (id: string | number) => unwrapItem<Project>(await api<unknown>(`/api/project/${id}/`)),
  create: (body: Partial<Project>) =>
    api<Project>("/api/project/", { method: "POST", json: body }).then(unwrapItem<Project>),
  createFromTemplate: (body: {
    template: number | string;
    name: string;
    token?: string;
    managed_bot_id?: number;
    envs?: Record<string, string>;
    credentials?: Record<string, number | string>;
  }) =>
    api<Project>("/api/project/create-from-template/", { method: "POST", json: body }).then(
      unwrapItem<Project>,
    ),
  managedBotConfig: async (): Promise<ManagedBotConfig> => {
    const d = await api<unknown>("/api/managed-bot/config/");
    return unwrapItem<ManagedBotConfig>(d);
  },
  listManagedBots: async (): Promise<ManagedBot[]> => {
    const d = await api<unknown>("/api/managed-bot/");
    return unwrapList<ManagedBot>(d);
  },
  templateRequirements: async (templateId: string | number): Promise<TemplateRequirements> => {
    const d = await api<unknown>("/api/v1/project/template-requirements/", {
      query: { template: templateId },
    });
    if (d && typeof d === "object") {
      const envelope = d as { status?: boolean; data?: TemplateRequirements };
      if (envelope.data && typeof envelope.data === "object") return envelope.data;
    }
    return d as TemplateRequirements;
  },
  update: (id: string | number, body: Partial<Project>) =>
    api<Project>(`/api/project/${id}/`, { method: "PATCH", json: body }).then(unwrapItem<Project>),
  remove: (id: string | number) => api<void>(`/api/project/${id}/`, { method: "DELETE" }),
  stopDebug: (id: string | number) => api<void>(`/api/project/${id}/stop/`),
  monitoring: async (id: string | number): Promise<ProjectMonitoring> => {
    const d = await api<unknown>(`/api/project/${id}/monitoring/`);
    return unwrapItem<ProjectMonitoring>(d);
  },
  monitoringHistory: async (
    id: string | number,
    range: MonitoringRange = "24h",
  ): Promise<ProjectMonitoringHistory> => {
    const d = await api<unknown>(`/api/project/${id}/monitoring/history/`, { query: { range } });
    return unwrapItem<ProjectMonitoringHistory>(d);
  },
};

// RELEASES
export const ReleasesAPI = {
  list: async (project: string | number) => {
    const d = await api<unknown>("/api/relase/", { query: { project } });
    return unwrapList<Release>(d);
  },
  create: (project: string | number) =>
    api<Release>("/api/relase/", { method: "POST", json: { project } }).then(unwrapItem<Release>),
  stop: (releaseId: string | number) => api<void>(`/api/relase/${releaseId}/stop/`),
  rollback: (releaseId: string | number) =>
    api<Release>(`/api/relase/${releaseId}/rollback/`, { method: "POST" }).then(unwrapItem<Release>),
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
  current: async (_project?: string | number) => {
    const d = await api<unknown>("/api/subscription/");
    return unwrapItem<Subscription>(d).plan;
  },
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
  listPaged: async (
    params: { project?: string | number; page?: number; page_size?: number } = {},
  ): Promise<PaginatedResult<FileItem>> => {
    const d = await api<unknown>("/api/file/", { query: params });
    return unwrapPaginated<FileItem>(d);
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
  page?: number | string;
};

export type PaginatedTemplates = {
  items: Template[];
  page: number;
  totalPages: number;
  hasMore: boolean;
};

function unwrapPaginatedTemplates(d: unknown): PaginatedTemplates {
  const items = unwrapList<Template>(d);
  let page = 1;
  let totalPages = 1;
  let hasNext = false;
  if (d && typeof d === "object") {
    type Pagination = { current_page?: number; total_pages?: number; links?: { next?: string | null } };
    const root = d as { data?: Pagination } & Pagination;
    const data: Pagination = root.data ?? root;
    page = Number(data.current_page) || 1;
    totalPages = Number(data.total_pages) || 1;
    hasNext = Boolean(data.links?.next);
  }
  return { items, page, totalPages, hasMore: hasNext || page < totalPages };
}

export const TemplatesAPI = {
  list: async (params: TemplateListParams = {}) => {
    const d = await api<unknown>("/api/template/list/", { query: params });
    return unwrapList<Template>(d);
  },
  listPaginated: async (params: TemplateListParams = {}): Promise<PaginatedTemplates> => {
    const d = await api<unknown>("/api/template/list/", { query: params });
    return unwrapPaginatedTemplates(d);
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

// BLOG (publik — login talab qilinmaydi)
export const BlogAPI = {
  list: async (params: { page?: number } = {}): Promise<PaginatedResult<BlogPostListItem>> => {
    const d = await api<unknown>("/api/blog/", { query: params });
    return unwrapPaginated<BlogPostListItem>(d);
  },
  get: (slug: string) => api<BlogPost>(`/api/blog/${slug}/`).then(unwrapItem<BlogPost>),
};

// TICKETS
export const TicketsAPI = {
  list: async () => {
    const d = await api<unknown>("/api/ticket/");
    return unwrapList<Ticket>(d);
  },
  get: (id: string | number) => api<Ticket>(`/api/ticket/${id}/`).then(unwrapItem<Ticket>),
  create: (body: FormData) =>
    api<Ticket>("/api/ticket/", { method: "POST", body }).then(unwrapItem<Ticket>),
  reply: (id: string | number, body: FormData) =>
    api<Ticket>(`/api/ticket/${id}/reply/`, { method: "POST", body }).then(unwrapItem<Ticket>),
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
  // Balansni to'ldirish — Click/Payme pay link qaytaradi.
  createTopUp: async (body: { method: "click" | "payme"; amount: number }): Promise<{ link: string }> => {
    const d = await api<unknown>("/api/payment/create-transaction/", { method: "POST", json: body });
    // Javob bir yoki ikki qavat {status,data} envelope ichida bo'lishi mumkin.
    const inner = unwrapItem<{ link?: string; data?: { link?: string } }>(d);
    return { link: inner?.link ?? inner?.data?.link ?? "" };
  },
};

// EARNINGS — bot to'lov daromadlari (balans + bot bo'yicha taqsimot + orderlar)
export const EarningsAPI = {
  summary: async (
    params: { project_in?: string; status?: string; provider?: string; page?: number } = {}
  ): Promise<EarningsSummary> => {
    const d = await api<unknown>("/api/earnings/", { query: params });
    return unwrapItem<EarningsSummary>(d);
  },
  detail: async (id: number | string): Promise<EarningsOrder> => {
    const d = await api<unknown>(`/api/earnings/${id}/`);
    return unwrapItem<EarningsOrder>(d);
  },
};

// WITHDRAWAL — bot daromadlaridan pul yechish
export const WithdrawalAPI = {
  list: async () => {
    const d = await api<unknown>("/api/withdrawal/");
    return unwrapList<WithdrawalRequest>(d);
  },
  create: (body: {
    project?: number | string | null;
    amount: number | string;
    card_number: string;
    card_owner: string;
  }) =>
    api<WithdrawalRequest>("/api/withdrawal/", { method: "POST", json: body }).then(
      unwrapItem<WithdrawalRequest>
    ),
  remove: (id: number | string) => api<void>(`/api/withdrawal/${id}/`, { method: "DELETE" }),
};

// KYC — verifikatsiya (pasport, rasm, ma'lumotnoma)
export const KycAPI = {
  // accounts app legacy rejimda root'da mount qilingan (/api/ ostida emas),
  // shuning uchun KYC uchun kanonik /api/v1/ surface ishlatiladi.
  status: async () => {
    const d = await api<unknown>("/api/v1/kyc/status/");
    return unwrapItem<KycStatusResponse>(d);
  },
  submit: async (body: FormData) => {
    const d = await api<unknown>("/api/v1/kyc/", { method: "POST", body });
    return unwrapItem<KycVerification>(d);
  },
};

// MESSAGES (broadcast)
export const MessagesAPI = {
  list: async (project?: string | number) => {
    const d = await api<unknown>("/api/message/", { query: { project } });
    return unwrapList<BroadcastMessage>(d);
  },
  send: (body: {
    project: number | string;
    caption: string;
    message_type?: "text" | "photo" | "video";
    button_type?: "inline" | "reply";
  }) =>
    api<BroadcastMessage>("/api/message/", {
      method: "POST",
      json: { message_type: "text", button_type: "reply", ...body },
    }),
  sendForm: (body: FormData) =>
    api<BroadcastMessage>("/api/message/", { method: "POST", body }),
  remove: (id: string | number) => api<void>(`/api/message/${id}/`, { method: "DELETE" }),
};

// CMSv2 — Django + MongoDB hybrid
function cms(projectId: string | number, ...parts: (string | number)[]): string {
  const tail = parts.map((p) => encodeURIComponent(p)).join("/");
  return `/api/cms/projects/${projectId}/collections${tail ? "/" + tail : ""}`;
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
    body: { name: string; label?: string; description?: string; primary_field?: string; fields?: CmsField[] }
  ): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId) + "/", { method: "POST", json: body }).then(
      unwrapItem<CmsCollection>
    ),
  updateCollection: (
    projectId: string | number,
    name: string,
    patch: { label?: string; description?: string; primary_field?: string }
  ): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId, name) + "/", { method: "PATCH", json: patch }).then(
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
  // Cursor pagination for relation pickers: pass the previous page's
  // next_cursor to fetch the next batch; optional search hits primary_field.
  listDocumentsCursor: (
    projectId: string | number,
    name: string,
    params: { cursor?: string | null; search?: string; limit?: number } = {}
  ): Promise<CmsDocumentCursorResponse> => {
    // paginate=cursor is the always-present flag (an empty cursor is dropped by
    // the query builder, so it can't signal cursor mode on the first page).
    const query: Record<string, string | number | undefined> = {
      paginate: "cursor",
      limit: params.limit ?? 30,
    };
    if (params.cursor) query.cursor = params.cursor;
    if (params.search) query.search = params.search;
    return api<CmsDocumentCursorResponse>(cms(projectId, name, "documents") + "/", { query });
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

// CREDENTIALS (owner-scoped global)
export const CredentialsAPI = {
  listTypes: async (): Promise<CredentialType[]> => {
    const d = await api<unknown>("/api/v1/credentials/types/");
    return unwrapList<CredentialType>(d);
  },
  list: async (params: { type_key?: string; page?: number; page_size?: number } = {}): Promise<CredentialListResponse> => {
    const d = await api<unknown>("/api/v1/credentials/", { query: params });
    return unwrapPaginated<Credential>(d);
  },
  get: async (id: string | number): Promise<Credential> =>
    unwrapCredential(await api<unknown>(`/api/v1/credentials/${id}/`)),
  create: (body: { type_key: string; name: string; data: Record<string, string> }): Promise<Credential> =>
    api<unknown>("/api/v1/credentials/", { method: "POST", json: body }).then(unwrapCredential),
  update: (id: string | number, body: { name?: string; data?: Record<string, string> }): Promise<Credential> =>
    api<unknown>(`/api/v1/credentials/${id}/`, { method: "PATCH", json: body }).then(unwrapCredential),
  remove: (id: string | number): Promise<void> =>
    api<void>(`/api/v1/credentials/${id}/`, { method: "DELETE" }),
  test: (id: string | number): Promise<{ ok: boolean }> =>
    api<{ ok: boolean }>(`/api/v1/credentials/${id}/test/`, { method: "POST" }).then(
      (d) => unwrapItem<{ ok: boolean }>(d)
    ),
  /**
   * Reveal decrypted secret field values for a credential.
   * Only the owner can call this (backend enforces via JWT).
   * Response: { "data": { "<field>": "<decrypted_value>", ... } }
   */
  reveal: async (id: string | number): Promise<Record<string, string>> => {
    const d = await api<unknown>(`/api/v1/credentials/${id}/reveal/`);
    if (d && typeof d === "object") {
      const envelope = d as { data?: Record<string, string>; status?: boolean };
      if (envelope.data && typeof envelope.data === "object") return envelope.data;
      // If backend returns flat { field: value } without envelope
      const { status: _s, ...rest } = envelope as Record<string, unknown>;
      return rest as Record<string, string>;
    }
    return {};
  },
  /**
   * Initiates an OAuth2 flow for the given provider + type_key.
   * Called server-side (Server Action) so the access token never touches the client.
   * Returns the authorize_url that the client opens in a popup.
   */
  oauthStart: async (provider: string, type_key: string): Promise<{ authorize_url: string }> => {
    const d = await api<unknown>(`/api/v1/credentials/oauth/${provider}/start/`, {
      method: "POST",
      json: { type_key },
    });
    const payload = unwrapItem<{ authorize_url?: string }>(d);
    const authorize_url = payload?.authorize_url ?? "";
    return { authorize_url };
  },
};

// DASHBOARD
export const DashboardAPI = {
  overview: () => api<DashboardOverview>("/api/dashboard/overview/"),
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
