import "server-only";
import { api, apiFetch } from "./server";
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
	KanbanBoard,
	KanbanCard,
	KanbanActivity,
	KanbanComment,
} from "@/shared/types/api";

// ─────────────────────────────────────────────────────────────────────────
// Go backend envelope (backend/go/internal/shared/httpx + every module's
// dto.go toListResponse): every list endpoint returns the SAME flat shape —
//   { items: T[], total: number, limit: number, offset: number }
// and every single-item endpoint returns the resource directly (no
// {status,data} wrapper like the old Django API). These two helpers replace
// the old envelope-guessing unwrap*/ItemEnvelope logic entirely.
// ─────────────────────────────────────────────────────────────────────────

type BackendListEnvelope<T> = { items?: T[]; total?: number; limit?: number; offset?: number };

function unwrapList<T>(d: unknown): T[] {
  if (Array.isArray(d)) return d as T[];
  if (!d || typeof d !== "object") return [];
  const e = d as BackendListEnvelope<T>;
  return Array.isArray(e.items) ? e.items : [];
}

export type PaginatedResult<T> = {
  results: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

/** UI pagination (1-based page/page_size) -> backend pagination (limit/offset). */
function toLimitOffset(params: { page?: number; page_size?: number }): { limit?: number; offset?: number } {
  const limit = params.page_size;
  if (!limit) return {};
  const page = Math.max(1, params.page ?? 1);
  return { limit, offset: (page - 1) * limit };
}

function unwrapPaginated<T>(d: unknown, fallbackLimit?: number): PaginatedResult<T> {
  const results = unwrapList<T>(d);
  const e = (d && typeof d === "object" ? (d as BackendListEnvelope<T>) : {}) as BackendListEnvelope<T>;
  const total = Number(e.total) || results.length;
  const limit = Number(e.limit) || fallbackLimit || results.length || 1;
  const offset = Number(e.offset) || 0;
  return {
    results,
    total_items: total,
    total_pages: Math.max(1, Math.ceil(total / limit)),
    current_page: Math.floor(offset / limit) + 1,
    page_size: limit,
  };
}

// PROJECTS — internal/modules/project (GET/POST /projects, GET/PATCH/DELETE /projects/:id)
export const ProjectsAPI = {
  list: async (search?: string) => {
    const d = await api<unknown>("/api/v1/projects", { query: { search } });
    return unwrapList<Project>(d);
  },
  listPaged: async (params: { search?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResult<Project>> => {
    const { limit, offset } = toLimitOffset(params);
    const d = await api<unknown>("/api/v1/projects", { query: { search: params.search, limit, offset } });
    return unwrapPaginated<Project>(d, params.page_size);
  },
  // NOTE: GET /projects/:id resolves the path param against the project's
  // primary `id`, NOT its `uuid` field (internal/modules/project/handler.go
  // pathID() -> uuid.Parse(c.Param("id")) against the PK). Callers must link
  // with project.id, not project.uuid.
  get: async (id: string | number) => api<Project>(`/api/v1/projects/${id}`),
  create: (body: Partial<Project>) => api<Project>("/api/v1/projects", { method: "POST", json: body }),
  update: (id: string | number, body: Partial<Project>) =>
    api<Project>(`/api/v1/projects/${id}`, { method: "PATCH", json: body }),
  remove: (id: string | number) => api<void>(`/api/v1/projects/${id}`, { method: "DELETE" }),

  // ── No backend equivalent yet — see mission report. Kept as no-op/throwing
  // stubs so existing callers (bot wizard, token dialog, monitoring tab)
  // keep compiling and fail gracefully instead of crashing the page.
  setBotToken: async (
    _projectId: string | number,
    _body: { token?: string; managed_bot_id?: string },
  ): Promise<{ detail: string; username: string }> => {
    throw new Error("Bot token ulash hali Go backend'da yo'q (project modulida deploy/engine ulanmagan)");
  },
  // internal/modules/project: POST /projects/create-from-template — resolves
  // + purchase-checks the template (buyer must already hold a paid order,
  // see TemplatesAPI.order/OrderButton) server-side and seeds a brand-new
  // project with its flow. managed_bot_id/credentials are accepted by the
  // backend's request shape but not wired yet (managed_bot_id gets an
  // explicit 400 instead of being silently ignored — see
  // project/handler.go's CreateFromTemplate).
  createFromTemplate: (body: {
    template: number | string;
    name: string;
    token?: string;
    managed_bot_id?: string;
    mode?: "release" | "debug";
    envs?: Record<string, string>;
    credentials?: Record<string, number | string>;
  }): Promise<Project> => api<Project>("/api/v1/projects/create-from-template", { method: "POST", json: body }),
  managedBotConfig: async (): Promise<ManagedBotConfig> => {
    const d = await api<unknown>("/api/v1/managed-bot/config");
    return d as ManagedBotConfig;
  },
  listManagedBots: async (): Promise<ManagedBot[]> => {
    const d = await api<unknown>("/api/v1/managed-bot");
    return unwrapList<ManagedBot>(d);
  },
  claimManagedBot: async (username: string): Promise<void> => {
    await api<unknown>("/api/v1/managed-bot/claim", { method: "POST", json: { username } });
  },
  templateRequirements: async (_templateId: string | number): Promise<TemplateRequirements> => {
    return { credentials: [], modules: [], envs: [] };
  },
  startDebug: (id: string | number) => api<void>(`/api/v1/projects/${id}/debug`),
  stopDebug: (id: string | number) => api<void>(`/api/v1/projects/${id}/debug/stop`),
  monitoring: async (id: string | number): Promise<ProjectMonitoring> =>
    api<ProjectMonitoring>(`/api/v1/projects/${id}/monitoring`),
  monitoringHistory: async (
    id: string | number,
    range: MonitoringRange = "24h",
  ): Promise<ProjectMonitoringHistory> => {
    const data = await api<Omit<ProjectMonitoringHistory, "range" | "step">>(
      `/api/v1/projects/${id}/monitoring/history`,
      { query: { range } },
    );
    return { range, step: "", ...data };
  },
};

export const KanbanAPI = {
  list: async (projectId?: string): Promise<KanbanBoard[]> => {
    const data = await api<unknown>("/api/v1/boards", { query: { project_id: projectId } });
    return unwrapList<KanbanBoard>(data);
  },
  get: (id: string, projectId?: string) =>
    api<KanbanBoard>(`/api/v1/boards/${id}`, { query: { project_id: projectId } }),
  create: (body: Record<string, unknown>) =>
    api<KanbanBoard>("/api/v1/boards", { method: "POST", json: body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<KanbanBoard>(`/api/v1/boards/${id}`, { method: "PUT", json: body }),
  archive: (id: string) => api<void>(`/api/v1/boards/${id}`, { method: "DELETE" }),
  linkProject: (id: string, projectId: string) =>
    api<void>(`/api/v1/boards/${id}/projects`, { method: "POST", json: { project_id: projectId } }),
  unlinkProject: (id: string, projectId: string) =>
    api<void>(`/api/v1/boards/${id}/projects/${projectId}`, { method: "DELETE" }),
  createColumn: (boardId: string, body: Record<string, unknown>) =>
    api(`/api/v1/boards/${boardId}/columns`, { method: "POST", json: body }),
  updateColumn: (boardId: string, columnId: string, body: Record<string, unknown>) =>
    api(`/api/v1/boards/${boardId}/columns/${columnId}`, { method: "PUT", json: body }),
  removeColumn: (boardId: string, columnId: string) =>
    api<void>(`/api/v1/boards/${boardId}/columns/${columnId}`, { method: "DELETE" }),
  createCard: (boardId: string, body: Record<string, unknown>) =>
    api<KanbanCard>(`/api/v1/boards/${boardId}/cards`, { method: "POST", json: body }),
  updateCard: (id: string, body: Record<string, unknown>) =>
    api<KanbanCard>(`/api/v1/cards/${id}`, { method: "PUT", json: body }),
  moveCard: (id: string, columnId: string, position: number) =>
    api<KanbanCard>(`/api/v1/cards/${id}/move`, { method: "POST", json: { column_id: columnId, position } }),
  archiveCard: (id: string) => api<KanbanCard>(`/api/v1/cards/${id}`, { method: "DELETE" }),
  activities: (id: string) => api<KanbanActivity[]>(`/api/v1/cards/${id}/activities`),
  comments: (id: string) => api<KanbanComment[]>(`/api/v1/cards/${id}/comments`),
  comment: (id: string, body: string) =>
    api<KanbanComment>(`/api/v1/cards/${id}/comments`, { method: "POST", json: { body } }),
};

// RELEASES — internal/modules/release ("/relase", mirrors legacy Django path)
export const ReleasesAPI = {
  list: async (project: string | number) => {
    const d = await api<unknown>("/api/v1/relase", { query: { project } });
    return unwrapList<Release>(d);
  },
  create: (project: string | number) =>
    api<Release>("/api/v1/relase", { method: "POST", json: { project_id: project } }),
  // NOTE: StopRelease is a GET in the Go backend (internal/modules/release/routes.go),
  // not a POST — mirrored here even though it's an odd verb for a mutation.
  stop: (releaseId: string | number) => api<void>(`/api/v1/relase/${releaseId}/stop`),
  rollback: (_releaseId: string | number): Promise<Release> => {
    throw new Error("Release rollback hali Go backend'da yo'q");
  },
};

// ENV VARS — internal/modules/release ("/enviroment"); DELETE keys off the
// project-scoped `key`, not a numeric row id (Go: DELETE /enviroment/:key,
// gated by the mandatory ?project= query param — handler.go's
// queryProjectID returns 400 "project.required" without it).
export const EnvAPI = {
  list: async (project: string | number) => {
    const d = await api<unknown>("/api/v1/enviroment", { query: { project } });
    return unwrapList<EnvVar>(d);
  },
  create: (body: { project: string | number; key: string; value: string; secret?: boolean }) =>
    api<EnvVar>("/api/v1/enviroment", {
      method: "POST",
      json: { project_id: body.project, key: body.key, value: body.value, secret: body.secret ?? false },
    }),
  remove: (key: string, project: string | number) =>
    api<void>(`/api/v1/enviroment/${encodeURIComponent(key)}`, { method: "DELETE", query: { project } }),
};

// PLANS — public, no auth needed
export const PlansAPI = {
  list: async () => {
    const d = await api<unknown>("/api/v1/plans");
    return unwrapList<Plan>(d);
  },
  current: async () => {
    const d = await api<Subscription>("/api/v1/subscription");
    return d.plan_details;
  },
};

// SUBSCRIPTION — per-user global plan
export const SubscriptionAPI = {
  current: async () => api<Subscription>("/api/v1/subscription"),
  usage: async () => api<SubscriptionUsage>("/api/v1/subscription/usage"),
  upgrade: (planId: number | string, months = 1) =>
    api<{ message: string; previous_plan: string; new_plan: string; data: Subscription }>(
      "/api/v1/subscription/upgrade",
      { method: "POST", json: { plan_id: planId, months } },
    ),
};

// FILES — internal/modules/file
export const FilesAPI = {
  list: async (project?: string | number) => {
    const d = await api<unknown>("/api/v1/file", { query: { project_id: project } });
    return unwrapList<FileItem>(d);
  },
  listPaged: async (
    params: { project?: string | number; page?: number; page_size?: number } = {},
  ): Promise<PaginatedResult<FileItem>> => {
    const { limit, offset } = toLimitOffset(params);
    const d = await api<unknown>("/api/v1/file", { query: { project_id: params.project, limit, offset } });
    return unwrapPaginated<FileItem>(d, params.page_size);
  },
  upload: async (body: FormData) => api<FileItem>("/api/v1/file", { method: "POST", body }),
  remove: (uuid: string | number) => api<void>(`/api/v1/file/${uuid}`, { method: "DELETE" }),
};

// TEMPLATES — internal/modules/template
export type TemplateListParams = {
  search?: string;
  categories?: string | number;
  features?: string | number;
  price_min?: number | string;
  price_max?: number | string;
  page?: number | string;
  page_size?: number | string;
};

// Template list javobidan massiv + jami sahifani ISHONCHLI o'qiydi. Backend
// ikki xil konvertda kelishi mumkin (eski `{items,...}` yoki yangi DRF
// `{status,data:{results,total_pages}}`) — sitemap kabi to'liq ro'yxat kerak
// bo'lganda ikkalasini ham qamrab olamiz (unwrapList faqat `items` o'qigani
// sabab yangi konvertda bo'sh qaytarardi).
function readTemplatePage(d: unknown): { items: Template[]; totalPages: number } {
  const root =
    d && typeof d === "object" && "data" in d ? (d as { data: unknown }).data : d;
  if (Array.isArray(root)) return { items: root as Template[], totalPages: 1 };
  const e = (root ?? {}) as {
    items?: Template[];
    results?: Template[];
    total_pages?: number;
  };
  const items = e.results ?? e.items ?? [];
  return { items, totalPages: Number(e.total_pages) || 1 };
}

export type PaginatedTemplates = {
  items: Template[];
  page: number;
  totalPages: number;
  hasMore: boolean;
};

function unwrapPaginatedTemplates(d: unknown): PaginatedTemplates {
  const items = unwrapList<Template>(d);
  const e = (d && typeof d === "object" ? (d as BackendListEnvelope<Template>) : {}) as BackendListEnvelope<Template>;
  const total = Number(e.total) || items.length;
  const limit = Number(e.limit) || items.length || 1;
  const offset = Number(e.offset) || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.floor(offset / limit) + 1;
  return { items, page, totalPages, hasMore: page < totalPages };
}

// The UI/URL uses `categories`/`features`/`price_min`/`price_max`, but the
// backend filter reads `category_id`/`feature_id`/`min_price`/`max_price`
// (see template handler List). Map here so every list call filters correctly.
function toTemplateQuery(
  params: TemplateListParams
): Record<string, string | number | boolean | null | undefined> {
  const { categories, features, price_min, price_max, ...rest } = params;
  return {
    ...rest,
    category_id: categories || undefined,
    feature_id: features || undefined,
    min_price: price_min || undefined,
    max_price: price_max || undefined,
  };
}

export const TemplatesAPI = {
  list: async (params: TemplateListParams = {}) => {
    const d = await api<unknown>("/api/v1/template/list", { query: toTemplateQuery(params) });
    return unwrapList<Template>(d);
  },
  listPaginated: async (params: TemplateListParams = {}): Promise<PaginatedTemplates> => {
    const d = await api<unknown>("/api/v1/template/list", { query: toTemplateQuery(params) });
    return unwrapPaginatedTemplates(d);
  },
  // BARCHA template'larni oladi (sitemap uchun) — katta page_size bilan bitta
  // so'rov (A+B), backend page_size'ni cheklab qo'ysa qolgan sahifalarni loop
  // qiladi. MAX_PAGES — runaway backstop (50×500=25k, real sondan ancha katta).
  // DIQQAT: yo'l oxirida TRAILING SLASH shart. /api/v2 cutover (API_PREFIX)
  // slashsiz `/template/list`ni query'ni tashlab yuboradigan 301'ga uzatadi
  // (natijada 20 ta default qaytadi); slash bilan page_size to'g'ri o'tadi (186).
  listAll: async (params: TemplateListParams = {}): Promise<Template[]> => {
    const PAGE_SIZE = 500;
    const MAX_PAGES = 50;
    const first = await api<unknown>("/api/v1/template/list/", {
      query: { ...toTemplateQuery(params), page: 1, page_size: PAGE_SIZE },
    });
    const { items, totalPages } = readTemplatePage(first);
    const all = [...items];
    const lastPage = Math.min(totalPages, MAX_PAGES);
    for (let page = 2; page <= lastPage; page++) {
      const d = await api<unknown>("/api/v1/template/list/", {
        query: { ...toTemplateQuery(params), page, page_size: PAGE_SIZE },
      });
      all.push(...readTemplatePage(d).items);
    }
    if (totalPages > MAX_PAGES) {
      console.warn(`[sitemap] template sahifalari cheklandi: ${totalPages} dan ${MAX_PAGES}`);
    }
    return all;
  },
  get: (slug: string) => api<Template>(`/api/v1/template/list/${slug}`),
  categories: async () => {
    const d = await api<unknown>("/api/v1/template/category");
    return unwrapList<TemplateCategory>(d);
  },
  features: async () => {
    const d = await api<unknown>("/api/v1/template/feature");
    return unwrapList<TemplateFeature>(d);
  },
  order: (templateId: string | number) =>
    api("/api/v1/template/orders", { method: "POST", json: { template_id: templateId } }),
};

// BLOG (publik — login talab qilinmaydi)
export const BlogAPI = {
  list: async (params: { page?: number } = {}): Promise<PaginatedResult<BlogPostListItem>> => {
    const { limit, offset } = toLimitOffset({ page: params.page, page_size: 10 });
    const d = await api<unknown>("/api/v1/blog", { query: { limit, offset } });
    return unwrapPaginated<BlogPostListItem>(d, 10);
  },
  get: (slug: string) => api<BlogPost>(`/api/v1/blog/${slug}`),
};

// TICKETS — internal/modules/ticket
export const TicketsAPI = {
  list: async () => {
    const d = await api<unknown>("/api/v1/tickets");
    return unwrapList<Ticket>(d);
  },
  get: (id: string | number) => api<Ticket>(`/api/v1/tickets/${id}`),
  create: (body: FormData) => api<Ticket>("/api/v1/tickets", { method: "POST", body }),
  reply: (id: string | number, body: FormData) =>
    api<Ticket>(`/api/v1/tickets/${id}/reply`, { method: "POST", body }),
};

// BILLING — internal/modules/payment + internal/modules/user
export const BillingAPI = {
  history: async () => {
    const d = await api<unknown>("/api/v1/payment/history");
    return unwrapList<Transaction>(d);
  },
  transactions: async () => {
    const d = await api<unknown>("/api/v1/payment/transactions");
    return unwrapList<Transaction>(d);
  },
  balance: async () => {
    const d = await api<{ balance: number; template_balance?: string }>("/api/v1/users/me/balance");
    return { balance: d.balance, template_balance: d.template_balance, currency: "UZS" };
  },
  // Balansni to'ldirish — Click/Payme pay link qaytaradi.
  // internal/modules/payment/dto.go CreatePaymentLinkRequest: `method` (click|payme)
  // + `amount` as a STRING (validate:"required" on a string field — a bare
  // number in the JSON body fails Go's json.Unmarshal into string, hence the
  // old "invalid request body" error).
  createTopUp: async (body: { method: "click" | "payme"; amount: number | string }): Promise<{ link: string }> => {
    const d = await api<{ link: string }>("/api/v1/payment/link", {
      method: "POST",
      json: { method: body.method, amount: String(body.amount) },
    });
    return { link: d?.link ?? "" };
  },
};

// EARNINGS — bot to'lov daromadlari (balans + bot bo'yicha taqsimot + orderlar)
export const EarningsAPI = {
  summary: async (
    params: { project_in?: string; status?: string; provider?: string; page?: number } = {}
  ): Promise<EarningsSummary> => {
    const { limit, offset } = toLimitOffset({ page: params.page, page_size: 20 });
    return api<EarningsSummary>("/api/v1/payment/earnings", {
      query: { project_id: params.project_in, status: params.status, provider: params.provider, limit, offset },
    });
  },
  detail: async (id: number | string): Promise<EarningsOrder> => api<EarningsOrder>(`/api/v1/payment/earnings/${id}`),
};

// WITHDRAWAL — bot daromadlaridan pul yechish
export const WithdrawalAPI = {
  list: async () => {
    const d = await api<unknown>("/api/v1/payment/withdrawals");
    return unwrapList<WithdrawalRequest>(d);
  },
  create: (body: {
    project?: number | string | null;
    amount: number | string;
    card_number: string;
    card_owner: string;
  }) =>
    api<WithdrawalRequest>("/api/v1/payment/withdrawals", {
      method: "POST",
      json: {
        project_id: body.project || undefined,
        amount: String(body.amount),
        card_number: body.card_number,
        card_owner: body.card_owner,
      },
    }),
  remove: (id: number | string) => api<void>(`/api/v1/payment/withdrawals/${id}`, { method: "DELETE" }),
};

// KYC — verifikatsiya (pasport, rasm, ma'lumotnoma)
export const KycAPI = {
  status: async () => api<KycStatusResponse>("/api/v1/kyc/status"),
  submit: async (body: FormData) => api<KycVerification>("/api/v1/kyc", { method: "POST", body }),
};

// MESSAGES (broadcast) — internal/modules/message
export const MessagesAPI = {
  list: async (project?: string | number) => {
    const d = await api<unknown>("/api/v1/messages", { query: { project_id: project } });
    return unwrapList<BroadcastMessage>(d);
  },
  send: (body: {
    project: number | string;
    caption: string;
    message_type?: "text" | "photo" | "video";
    button_type?: "inline" | "reply";
  }) =>
    api<BroadcastMessage>("/api/v1/messages", {
      method: "POST",
      json: {
        project_id: body.project,
        caption: body.caption,
        message_type: body.message_type ?? "text",
        button_type: body.button_type ?? "reply",
      },
    }),
  sendForm: (body: FormData) => api<BroadcastMessage>("/api/v1/messages", { method: "POST", body }),
  remove: (id: string | number) => api<void>(`/api/v1/messages/${id}`, { method: "DELETE" }),
};

// CMSv2 — collection schema in Postgres, documents in Mongo (internal/modules/cms)

// Lowercase snake_case, ASCII-only — matches CreateCollectionRequest.Slug's
// validate:"required,min=1,max=80" and the Mongo-collection-name constraint
// (see dto.go comment). Falls back to "collection" if nothing survives
// (e.g. an all-emoji/non-latin name), since an empty slug always 400s.
function slugify(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return s || "collection";
}

function cms(projectId: string | number, ...parts: (string | number)[]): string {
  const tail = parts.map((p) => encodeURIComponent(p)).join("/");
  return `/api/v1/cms/projects/${projectId}/collections${tail ? "/" + tail : ""}`;
}

export const CmsAPI = {
  listCollections: async (projectId: string | number): Promise<CmsCollection[]> => {
    const d = await api<unknown>(cms(projectId));
    return unwrapList<CmsCollection>(d);
  },
  getCollection: (projectId: string | number, name: string): Promise<CmsCollection> =>
    api<CmsCollection>(cms(projectId, name)),
  // internal/modules/cms dto.go CreateCollectionRequest requires BOTH `name`
  // (required) and `slug` (required, min=1, max=80, lowercase snake_case —
  // becomes the immutable Mongo collection name). The dashboard's schema
  // form only collects one identifier field (already restricted to
  // [a-z0-9_]), so it doubles as the slug unless the caller passes one
  // explicitly. `label`/`fields` have no counterpart in this request (kept
  // for the caller's own bookkeeping; fields are added afterwards via
  // addField, same as before).
  createCollection: (
    projectId: string | number,
    body: {
      name: string;
      slug?: string;
      label?: string;
      description?: string;
      primary_field?: string;
      fields?: CmsField[];
    }
  ): Promise<CmsCollection> => {
    const slug = slugify(body.slug || body.name);
    return api<CmsCollection>(cms(projectId), {
      method: "POST",
      json: {
        name: body.name,
        slug,
        description: body.description,
        primary_field: body.primary_field,
      },
    });
  },
  updateCollection: (
    projectId: string | number,
    name: string,
    patch: { label?: string; description?: string; primary_field?: string }
  ): Promise<CmsCollection> => api<CmsCollection>(cms(projectId, name), { method: "PATCH", json: patch }),
  deleteCollection: (projectId: string | number, name: string): Promise<void> =>
    api<void>(cms(projectId, name), { method: "DELETE" }),
  addField: (projectId: string | number, name: string, field: CmsField): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields"), { method: "POST", json: field }),
  updateField: (
    projectId: string | number,
    name: string,
    fieldName: string,
    patch: Partial<CmsField>
  ): Promise<CmsField> =>
    api<CmsField>(cms(projectId, name, "fields", fieldName), { method: "PATCH", json: patch }),
  removeField: (projectId: string | number, name: string, fieldName: string): Promise<void> =>
    api<void>(cms(projectId, name, "fields", fieldName), { method: "DELETE" }),

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
    return api<CmsDocumentListResponse>(cms(projectId, name, "documents"), { query });
  },
  // Cursor pagination for relation pickers: pass the previous page's
  // next_cursor to fetch the next batch; optional search hits primary_field.
  listDocumentsCursor: (
    projectId: string | number,
    name: string,
    params: { cursor?: string | null; search?: string; limit?: number } = {}
  ): Promise<CmsDocumentCursorResponse> => {
    const query: Record<string, string | number | undefined> = {
      paginate: "cursor",
      limit: params.limit ?? 30,
    };
    if (params.cursor) query.cursor = params.cursor;
    if (params.search) query.search = params.search;
    return api<CmsDocumentCursorResponse>(cms(projectId, name, "documents"), { query });
  },
  getDocument: (projectId: string | number, name: string, id: string): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents", id)),
  insertDocument: (
    projectId: string | number,
    name: string,
    document: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents"), { method: "POST", json: document }),
  bulkInsert: async (
    _projectId: string | number,
    _name: string,
    _documents: Record<string, unknown>[]
  ): Promise<{ inserted_ids: string[]; count: number }> => {
    throw new Error("CMS bulk insert hali Go backend'da yo'q");
  },
  updateDocument: (
    projectId: string | number,
    name: string,
    id: string,
    patch: Record<string, unknown>
  ): Promise<CmsDocument> =>
    api<CmsDocument>(cms(projectId, name, "documents", id), { method: "PATCH", json: patch }),
  deleteDocument: (projectId: string | number, name: string, id: string): Promise<void> =>
    api<void>(cms(projectId, name, "documents", id), { method: "DELETE" }),
  restoreDocument: async (): Promise<unknown> => {
    throw new Error("CMS document restore hali Go backend'da yo'q");
  },
  aggregate: async (): Promise<{ results: CmsDocument[]; count: number }> => {
    throw new Error("CMS aggregate hali Go backend'da yo'q");
  },
  audit: async (
    _projectId: string | number,
    _name: string,
    _params: { action?: string; document_id?: string } = {}
  ): Promise<CmsAuditEntry[]> => [],
};

// CREDENTIALS (owner-scoped global) — internal/modules/credential
function toCredential(raw: unknown): Credential {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    owner_id: r.owner_id as string | undefined,
    name: r.name as string,
    type_key: r.type_key as string,
    label: r.label as string | undefined,
    mode: r.mode as string | undefined,
    type: {
      key: r.type_key as string,
      label: (r.label as string) ?? (r.type_key as string),
      mode: (r.mode as string) ?? "",
    },
    data: (r.data as Record<string, string>) ?? {},
    updated_at: r.updated_at as string,
  };
}

export const CredentialsAPI = {
  listTypes: async (): Promise<CredentialType[]> => {
    const d = await api<unknown>("/api/v1/credentials/types");
    return unwrapList<CredentialType>(d);
  },
  list: async (params: { type_key?: string; page?: number; page_size?: number } = {}): Promise<CredentialListResponse> => {
    const { limit, offset } = toLimitOffset(params);
    const d = await api<unknown>("/api/v1/credentials", { query: { type_key: params.type_key, limit, offset } });
    const p = unwrapPaginated<unknown>(d, params.page_size);
    return {
      results: p.results.map(toCredential),
      total_items: p.total_items,
      total_pages: p.total_pages,
      current_page: p.current_page,
      page_size: p.page_size,
    };
  },
  get: async (id: string | number): Promise<Credential> =>
    toCredential(await api<unknown>(`/api/v1/credentials/${id}`)),
  create: (body: { type_key: string; name: string; data: Record<string, string> }): Promise<Credential> =>
    api<unknown>("/api/v1/credentials", { method: "POST", json: body }).then(toCredential),
  update: (id: string | number, body: { name?: string; data?: Record<string, string> }): Promise<Credential> =>
    api<unknown>(`/api/v1/credentials/${id}`, { method: "PATCH", json: body }).then(toCredential),
  remove: (id: string | number): Promise<void> => api<void>(`/api/v1/credentials/${id}`, { method: "DELETE" }),

  // ── No route in the Go backend yet (internal/modules/credential/routes.go
  // exposes only list/create/types/get/patch/delete) — see mission report.
  test: async (_id: string | number): Promise<{ ok: boolean }> => {
    throw new Error("Credential test hali Go backend'da yo'q");
  },
  reveal: async (_id: string | number): Promise<Record<string, string>> => {
    throw new Error("Credential reveal hali Go backend'da yo'q (data har doim maskalangan qaytadi)");
  },
  // POST /api/v1/credentials/oauth/:provider/start {type_key} -> {authorize_url}
  // (internal/modules/credential/routes.go). Redirect the browser to authorize_url;
  // Google's callback is handled at /api/v1/credentials/oauth/:provider/callback.
  oauthStart: async (provider: string, type_key: string): Promise<{ authorize_url: string }> =>
    api<{ authorize_url: string }>(`/api/v1/credentials/oauth/${provider}/start`, {
      method: "POST",
      json: { type_key },
    }),
};

// DASHBOARD
// NOTE: the Go backend has no user-facing dashboard overview endpoint (only
// GET /admin/stats/dashboard, admin/superuser-only — internal/modules/administration).
// This synthesizes an equivalent client-side from what IS available:
// projects + subscription usage. Per-bot message counts, revenue, audience
// distribution and the daily performance series have no backend source yet,
// so they come back zeroed/empty rather than fabricated.
export const DashboardAPI = {
  overview: async (): Promise<DashboardOverview> => {
    const [projects, usage] = await Promise.all([
      ProjectsAPI.list().catch(() => [] as Project[]),
      SubscriptionAPI.usage().catch(() => null),
    ]);
    return {
      totals: {
        bots: projects.length,
        active_bots: projects.length,
        users: 0,
        messages: 0,
        templates: 0,
        revenue: 0,
        currency: "UZS",
      },
      performance: [],
      top_bots: projects.slice(0, 5).map((p) => ({ id: p.id, name: p.name, messages: 0, delta: null })),
      distribution: { private: 0, group: 0, channel: 0, other: 0 },
    };
    // `usage` is fetched (and available to future callers) but the current
    // DashboardOverview shape has no slot for it yet — see StatCardsV2 /
    // billing page which already read SubscriptionAPI.usage() directly.
    void usage;
  },
};

// API TOKENS — no equivalent module in the Go backend (no auth/api-tokens
// routes registered in internal/server/server.go). Kept as an empty/throwing
// stub so the settings page compiles; see mission report.
export const APITokensAPI = {
  list: async (): Promise<{ id: number; name: string; prefix: string; last_used_at: string | null; created_at: string }[]> => [],
  create: async (_name: string): Promise<{ id: number; name: string; token: string; prefix: string }> => {
    throw new Error("API tokenlar hali Go backend'da yo'q");
  },
  remove: async (_id: number | string): Promise<void> => {
    throw new Error("API tokenlar hali Go backend'da yo'q");
  },
};

// AUTH (profile) — internal/modules/user
export const AuthAPI = {
  me: async () =>
    api<{ id: string; first_name?: string; last_name?: string; email?: string; phone?: string; avatar?: string }>(
      "/api/v1/users/me"
    ),
  updateProfile: (body: { name?: string; email?: string; first_name?: string; last_name?: string }) =>
    api("/api/v1/users/me", {
      method: "PATCH",
      json: { first_name: body.first_name, last_name: body.last_name, email: body.email },
    }),
  changePassword: (body: { old_password: string; new_password: string }) =>
    api("/api/v1/users/me/password", { method: "POST", json: body }),
};
