export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Project = {
  id: number | string;
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
  plan: Plan;
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
};

export type Ticket = {
  id: number | string;
  subject: string;
  status: "open" | "closed" | "pending";
  message?: string;
  created_at?: string;
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
  text: string;
  scheduled_at?: string;
  status?: "draft" | "scheduled" | "sent" | "failed";
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
};

export type CmsDocumentListResponse = {
  results: CmsDocument[];
  total: number;
  limit: number;
  skip: number;
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
