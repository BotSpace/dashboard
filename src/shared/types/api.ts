// Types mirror the Go backend's DTOs (backend/go/internal/modules/*/dto.go).
// Every list endpoint uses the SAME envelope: `{ items, total, limit, offset }`
// (see shared/api/services.ts `unwrapList`/`unwrapPaginated`). Single-item
// endpoints return the resource directly — there is no `{status,data}`
// wrapper like the old Django API had. IDs are UUID strings everywhere.
//
// Some fields below are kept OPTIONAL even though the current Go backend
// never sends them — they're old Django-era fields still read by UI
// components (avatar, bot status/mode, etc.) that have no backend equivalent
// yet. Marking them optional keeps those components compiling/rendering
// (with a graceful "unknown" fallback) without a UI redesign; see the
// mission report for the full list of gaps.

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ProjectMonitoring = {
  cpu_cores: number | null;
  memory_bytes: number | null;
  net_rx_bps: number | null;
  net_tx_bps: number | null;
  disk_bytes: number | null;
  disk_files_bytes: number | null;
  disk_cms_bytes: number | null;
  prometheus_available: boolean;
};

/** One time-series point: [unix_ts_seconds, value]. */
export type MetricPoint = [number, number];

export type MonitoringRange = "1h" | "6h" | "24h" | "7d";

export type ProjectMonitoringHistory = {
  range: MonitoringRange;
  step: string;
  prometheus_available: boolean;
  series: {
    cpu_cores: MetricPoint[];
    memory_bytes: MetricPoint[];
    net_rx_bps: MetricPoint[];
    net_tx_bps: MetricPoint[];
    disk_bytes: MetricPoint[];
  };
};

// project.ProjectResponse (internal/modules/project/dto.go)
export type Project = {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  username?: string;
  owner_id: string;
  flow?: unknown;
  is_template: boolean;
  release_webhook_uuid: string;
  debug_webhook_uuid: string;
  created_at: string;
  updated_at: string;

  // ── No backend equivalent yet (see report) — kept optional so existing
  // bot-list/bot-detail UI still renders a graceful fallback instead of
  // crashing on a missing field.
  avatar?: string;
  token?: string;
  status?: "active" | "inactive" | "draft";
  bot_mode?: "release" | "debug";
  bot_username?: string | null;
  bot_link?: string | null;
  debug?: { status?: string } | null;
  release_bot?: boolean;
  debug_bot?: boolean;
};

export type KanbanPriority = "low" | "normal" | "high" | "urgent";

export type KanbanColumn = {
  id: string;
  board_id: string;
  name: string;
  color: string;
  position: number;
  wip_limit: number | null;
  is_terminal: boolean;
  created_at: string;
  updated_at: string;
};

export type KanbanCard = {
  id: string;
  board_id: string;
  column_id: string;
  source_project_id: string | null;
  kind: string;
  title: string;
  description: string;
  priority: KanbanPriority;
  position: number;
  due_at: string | null;
  external_key: string | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type KanbanActivity = {
  id: string;
  card_id: string;
  actor_id: string | null;
  event: string;
  data: Record<string, unknown>;
  created_at: string;
};

export type KanbanComment = {
  id: string;
  card_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type KanbanBoard = {
  id: string;
  owner_id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  card_type_label: string;
  field_schema: Array<{ key: string; label: string; type: string }>;
  card_count: number;
  project_ids: string[];
  projects?: Array<{ id: string; name: string }>;
  columns?: KanbanColumn[];
  cards?: KanbanCard[];
  created_at: string;
  updated_at: string;
};

// release.ReleaseResponse
export type Release = {
  id: string;
  project_id: string;
  version?: number;
  service_id?: string;
  status?: "running" | "stopped" | "failed" | "pending";
  created_at?: string;
};

// release.EnvironmentResponse (path: /enviroment, keyed by `key`, not numeric id)
export type EnvVar = {
  id: string;
  key: string;
  value: string;
  secret?: boolean;
  created_at?: string;
  updated_at?: string;
};

// plan.PlanResponse
export type Plan = {
  id: string;
  name: string;
  name_display?: string;
  price: number | string;
  currency?: string;
  max_bots?: number;
  max_tokens?: number;
  /** @deprecated backend reports a single `max_tokens` pool — kept for old callers */
  max_output_tokens?: number;
  /** @deprecated see max_output_tokens */
  max_input_tokens?: number;
  features?: string[] | Record<string, unknown>;
  is_top?: boolean;
  is_default?: boolean;
  is_active?: boolean;
  description?: string;
};

// plan.SubscriptionResponse
export type Subscription = {
  id: string;
  plan: string;
  plan_details?: Plan;
  status: "active" | "suspended" | "grace_period" | "cancelled";
  status_display?: string;
  started_at?: string;
  expires_at?: string | null;
  tokens_used_input: number;
  tokens_used_output: number;
  tokens_remaining?: number;
  is_token_limit_exceeded?: boolean;
  token_reset_at?: string;
  bots_count: number;
  can_create_bot?: boolean;
};

// plan.UsageResponse
export type SubscriptionUsage = {
  plan?: string;
  status: string;
  plan_name: string;
  tokens_used_input: number;
  tokens_used_output: number;
  tokens_limit: number;
  tokens_remaining: number;
  bots_count: number;
  max_bots: number;
  usage_percentage: number;
  ai_token_usage?: {
    limit: number;
    used: number;
    remaining: number;
    input_used: number;
    output_used: number;
    plan?: { id?: string; name?: string; display?: string } | null;
    status?: string | null;
    token_reset_at?: string | null;
  };
  token_reset_at?: string;
  expires_at?: string | null;
};

// file.FileResponse
export type FileItem = {
  id: string;
  uuid: string;
  project_id?: string | null;
  name: string;
  url?: string;
  size?: number;
  filetype?: string;
  /** @deprecated old Django field name — use `filetype` */
  mime?: string;
  created_at?: string;
  expires_at?: string | null;
};

export type TemplateCategory = {
  id: string;
  name: string;
};

export type TemplateFeature = {
  id: string;
  name: string;
  value?: string | null;
};

// template.TemplateResponse
export type Template = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  video?: string | null;
  short_description?: string;
  description?: string;
  price: number | string;
  original_price: number | string;
  discount?: number | string;
  discount_type?: "PERCENT" | "AMOUNT" | "percent" | "amount";
  categories: TemplateCategory[];
  features: TemplateFeature[];
  views?: number;
  likes_count?: number;
  /** @deprecated old field name — use likes_count */
  likes?: number;
  is_liked?: boolean;
  is_ordered?: boolean;
  demo_url?: string | null;
  required_envs?: { key: string; description?: string }[];
};

export type TemplateRequirementCredential = {
  key: string;
  type: string;
  label: string;
  required: boolean;
  description?: string;
};

export type TemplateRequirementModule = {
  slug: string;
  required: boolean;
};

export type TemplateRequirementEnv = {
  key: string;
  required: boolean;
  label?: string;
  description?: string;
};

export type TemplateRequirements = {
  credentials: TemplateRequirementCredential[];
  modules: TemplateRequirementModule[];
  envs: TemplateRequirementEnv[];
};

// ticket.TicketMessageResponse / TicketResponse
export type TicketMessage = {
  id: string;
  sender: "user" | "admin";
  message: string;
  attachment_url?: string | null;
  /** @deprecated old field name — use attachment_url */
  attachment?: string | null;
  created_at?: string;
};

export type Ticket = {
  id: string;
  subject: string;
  status: "open" | "closed" | "pending";
  last_message?: { sender: string; message: string } | null;
  messages?: TicketMessage[];
  created_at?: string;
  updated_at?: string;
};

// payment.TransactionResponse / HistoryResponse
export type Transaction = {
  id: string;
  amount: number | string;
  currency?: string;
  type?: string;
  status?: string | boolean;
  comment?: string;
  created_at?: string;
};

// message.MessageResponse
export type BroadcastMessage = {
  id: string;
  project_id: string;
  caption: string;
  message_type: "text" | "photo" | "video";
  button_type?: "inline" | "reply";
  buttons?: unknown[];
  status?: "progress" | "done" | "failed";
  total?: number;
  done?: number;
  fail?: number;
  file_id?: string | null;
};

export type ResourceMetric = {
  project_id: string;
  cpu?: number;
  ram?: number;
  traffic?: number;
  timestamp?: string;
};

// ── cms ────────────────────────────────────────────────────────────────────

export type CmsFieldKind =
  | "text"
  | "longtext"
  | "int"
  | "float"
  | "bool"
  | "datetime"
  | "date"
  | "email"
  | "url"
  | "phone"
  | "enum"
  | "json"
  | "array"
  | "relation"
  | "file"
  | "image"
  | "audio"
  | "video"
  | "geo";

export type CmsIndexKind =
  | "none"
  | "asc"
  | "desc"
  | "text"
  | "hashed"
  | "unique"
  | "ttl";

export type CmsCascadeMode = "cascade" | "restrict" | "set_null";

export type CmsField = {
  id?: string;
  name: string;
  label?: string;
  kind: CmsFieldKind;
  required: boolean;
  default?: unknown;
  validators?: Record<string, unknown>;
  relation_collection?: string | null;
  cascade?: CmsCascadeMode;
  index: CmsIndexKind;
  order?: number;
};

export type CmsCollection = {
  id: string;
  project_id: string;
  name: string;
  slug?: string;
  label?: string;
  description?: string;
  primary_field?: string;
  system: boolean;
  schema_version: number;
  fields_count?: number;
  fields?: CmsField[];
  can_delete?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CmsDocument = Record<string, unknown> & {
  _id?: string;
  _created_at?: string;
  _updated_at?: string;
  _version?: number;
  _deleted_at?: string | null;
  // Server-resolved relation labels, keyed by field name (string or list of strings).
  _rel?: Record<string, string | string[]>;
};

export type CmsDocumentListResponse = {
  results: CmsDocument[];
  total: number;
  limit: number;
  skip: number;
};

// Cursor-paginated page (relation picker infinite-scroll). next_cursor is the
// last _id of a full page, or null when there are no more documents.
export type CmsDocumentCursorResponse = {
  results: CmsDocument[];
  limit: number;
  next_cursor: string | null;
};

// ── Dashboard ──────────────────────────────────────────────────────────────
// NOTE: the Go backend has no user-facing "/dashboard/overview" endpoint
// (only an admin-only "/admin/stats/dashboard"). This shape is synthesized
// client-side in DashboardAPI.overview() from /projects + /subscription/usage
// — see services.ts and the mission report for what's missing (per-bot
// message counts, revenue, audience distribution, daily performance series).

export type DashboardOverview = {
  totals: {
    bots: number;
    active_bots: number;
    users: number;
    messages: number;
    templates: number;
    revenue: number;
    currency: string;
  };
  performance: { date: string; value: number }[];
  top_bots: { id: string; name: string; messages: number; delta: number | null }[];
  distribution: { private: number; group: number; channel: number; other: number };
};

export type CmsAuditEntry = {
  id: string;
  action: string;
  actor_id: string | null;
  document_id: string;
  before: CmsDocument | null;
  after: CmsDocument | null;
  meta: Record<string, unknown>;
  created_at: string;
};

// EARNINGS (bot to'lov daromadlari) — payment.ProjectEarningResponse / OrderResponse
export type BotEarning = {
  project_id: string;
  project_name: string;
  total_earned: string;
  count: number;
};

export type EarningsOrder = {
  id: string;
  project_id: string;
  project_name?: string;
  payer_chat_id?: number | string;
  payer_first_name?: string | null;
  payer_last_name?: string | null;
  payer_username?: string | null;
  amount: string;
  commission: string;
  net_amount: string;
  status: string;
  provider: string;
  comment?: string;
  external_id?: string | null;
  created_at?: string;
  paid_at?: string | null;
};

export type EarningsSummary = {
  balance: number;
  withdrawable: string;
  total_earned: string;
  total_commission: string;
  by_bot: BotEarning[];
  orders: EarningsOrder[];
  count?: number;
  limit?: number;
  offset?: number;
};

// WITHDRAWAL (pul yechish) — payment.WithdrawalResponse
export type WithdrawalStatus = "pending" | "approved" | "rejected";

export type WithdrawalRequest = {
  id: string;
  project_id?: string | null;
  project_name?: string | null;
  amount: string;
  card_number: string;
  card_owner: string;
  status: WithdrawalStatus | string;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

// KYC verifikatsiya — kyc.VerificationResponse / StatusResponse
export type KycStatus = "pending" | "approved" | "rejected";

export type KycVerification = {
  id: string;
  full_name: string;
  passport_image: string;
  selfie_image: string;
  residence_reference: string;
  status: KycStatus | string;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type KycStatusResponse = {
  is_verified: boolean;
  verification: KycVerification | null;
};

// CREDENTIALS (owner-scoped global) — credential.CredentialResponse / TypeDef
export type CredentialFieldType = "text" | "password" | "number" | "select" | "textarea" | "url" | "switch";

export type CredentialFieldOption = {
  value: string;
  label: string;
};

export type CredentialField = {
  name: string;
  label: string;
  type: CredentialFieldType;
  secret?: boolean;
  required?: boolean;
  default?: string | number;
  options?: CredentialFieldOption[];
};

export type CredentialType = {
  key: string;
  label: string;
  mode: "apikey" | "bearer" | "header" | "basic" | "none" | "oauth2";
  icon?: string;
  /** Brand color (hex) for the icon */
  color?: string;
  /** Present on oauth2 types — e.g. "google" */
  provider?: string;
  /** OAuth scopes requested */
  scopes?: string[];
  fields: CredentialField[];
};

export type Credential = {
  id: string;
  owner_id?: string;
  name: string;
  type_key: string;
  label?: string;
  mode?: string;
  // Old UI code reads `type.key/label/mode` — kept as a derived nested shape
  // (populated in services.ts from the flat type_key/label/mode fields the
  // Go backend actually sends).
  type: {
    key: string;
    label: string;
    mode: string;
  };
  data: Record<string, string>;
  updated_at: string;
};

export type CredentialListResponse = {
  results: Credential[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

// Managed Bot — internal/modules/webhook (still Django-shaped IDs pending port)
export type ManagedBot = {
  id: string;
  tg_bot_id: string;
  username: string;
  name: string;
  used: boolean;
  created_at: string;
};

export type ManagedBotConfig = {
  enabled: boolean;
  manager_username?: string;
  deep_link_template?: string;
};

// Blog (publik) — blog.PublicListItemResponse / PublicDetailResponse
export type BlogPostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  reading_time: number;
  published_at: string | null;
};

export type BlogPost = BlogPostListItem & {
  content: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};
