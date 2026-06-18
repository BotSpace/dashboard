export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Project = {
  id: number | string;
  uuid?: string;
  name: string;
  description?: string;
  token?: string;
  username?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  status?: "active" | "inactive" | "draft";
  flow?: unknown;
};

export type Release = {
  id: number | string;
  project: number | string;
  version?: number | string;
  service_id?: string;
  status?: "running" | "stopped" | "failed" | "pending";
  created_at?: string;
};

export type EnvVar = {
  id: number | string;
  project: number | string;
  key: string;
  value: string;
};

export type Plan = {
  id: number | string;
  name: string;
  name_display?: string;
  price: number;
  currency?: string;
  max_bots?: number;
  max_output_tokens?: number;
  max_input_tokens?: number;
  features?: string[] | Record<string, unknown>;
  is_default?: boolean;
  is_active?: boolean;
};

export type Subscription = {
  id: number | string;
  // Backend `plan` ni FK id (raqam) qilib qaytaradi; to'liq obyekt `plan_details`da.
  plan: number | string;
  plan_details?: Plan;
  status: "active" | "suspended" | "cancelled";
  started_at?: string;
  expires_at?: string;
  tokens_used_input: number;
  tokens_used_output: number;
  token_reset_at?: string;
  bots_count: number;
};

export type SubscriptionUsage = {
  ai_token_usage?: {
    limit: number;
    used: number;
    remaining: number;
    input_used: number;
    output_used: number;
    plan?: { id?: number | string; name?: string; display?: string } | string | null;
    status?: string | null;
    token_reset_at?: string | null;
  };
  tokens_used_input: number;
  tokens_used_output: number;
  tokens_limit_output: number;
  tokens_limit_input: number;
  tokens_remaining: number;
  bots_count: number;
  max_bots: number;
  plan_name: string;
  status: string;
  usage_percentage: number;
  token_reset_at?: string;
};

export type FileItem = {
  id: number | string;
  name: string;
  url?: string;
  size?: number;
  mime?: string;
  project?: number | string | null;
  created_at?: string;
};

export type TemplateCategory = {
  id: number | string;
  name: string;
};

export type TemplateFeature = {
  id: number | string;
  name: string;
  value?: string | null;
};

export type Template = {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  video?: string | null;
  short_description?: string;
  description?: string;
  price: number | string;
  original_price: number | string;
  discount?: number | string;
  discount_type?: "PERCENT" | "AMOUNT";
  categories: TemplateCategory[];
  features: TemplateFeature[];
  views?: number;
  likes?: number;
  is_order?: boolean;
  demo_url?: string | null;
  required_envs?: { key: string; description?: string }[];
};

export type TicketMessage = {
  id: number | string;
  sender: "user" | "admin";
  message: string;
  attachment?: string | null;
  created_at?: string;
};

export type Ticket = {
  id: number | string;
  subject: string;
  status: "open" | "closed" | "pending";
  last_message?: { sender: string; message: string } | null;
  messages?: TicketMessage[];
  created_at?: string;
  updated_at?: string;
};

export type Transaction = {
  id: number | string;
  amount: number;
  currency?: string;
  type?: string;
  status?: string;
  created_at?: string;
};

export type BroadcastMessage = {
  id: number | string;
  project: number | string;
  caption: string;
  message_type: "text" | "photo" | "video";
  button_type?: "inline" | "reply";
  buttons?: unknown[];
  status?: "progress" | "done" | "failed";
  total?: number;
  done?: number;
  fail?: number;
  file_id?: string;
};

export type ResourceMetric = {
  project: number | string;
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
  id?: number;
  name: string;
  label?: string;
  kind: CmsFieldKind;
  required: boolean;
  default?: unknown;
  validators?: Record<string, unknown>;
  relation_collection?: number | null;
  cascade?: CmsCascadeMode;
  index: CmsIndexKind;
  order?: number;
};

export type CmsCollection = {
  id: number;
  project: number;
  name: string;
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
  top_bots: { id: number | string; name: string; messages: number; delta: number | null }[];
  distribution: { private: number; group: number; channel: number; other: number };
};

export type CmsAuditEntry = {
  id: number;
  action: string;
  actor_id: number | null;
  document_id: string;
  before: CmsDocument | null;
  after: CmsDocument | null;
  meta: Record<string, unknown>;
  created_at: string;
};

// EARNINGS (bot to'lov daromadlari)
export type BotEarning = {
  project_id: number | string;
  project_name: string;
  total_earned: string;
  count: number;
};

export type EarningsOrder = {
  id: number | string;
  project_id: number | string;
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
  paid_at?: string;
};

export type EarningsSummary = {
  balance: number;
  withdrawable: string;
  total_earned: string;
  total_commission: string;
  by_bot: BotEarning[];
  orders: EarningsOrder[];
  count?: number;
  next?: string | null;
  previous?: string | null;
};

// WITHDRAWAL (pul yechish)
export type WithdrawalStatus = "pending" | "approved" | "rejected";

export type WithdrawalRequest = {
  id: number | string;
  project: number | string | null;
  project_name?: string | null;
  amount: string;
  card_number: string;
  card_owner: string;
  status: WithdrawalStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

// KYC verifikatsiya
export type KycStatus = "pending" | "approved" | "rejected";

export type KycVerification = {
  id: number | string;
  full_name: string;
  passport_image: string;
  selfie_image: string;
  residence_reference: string;
  status: KycStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type KycStatusResponse = {
  is_verified: boolean;
  verification: KycVerification | null;
};

// CREDENTIALS (owner-scoped global)
export type CredentialFieldType = "text" | "password" | "number" | "select" | "textarea";

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
  id: number | string;
  name: string;
  type_key: string;
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

// Blog (publik)
export type BlogPostListItem = {
  id: number;
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
