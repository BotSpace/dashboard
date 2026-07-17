"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Key,
  Shield,
  Mail,
  Table,
  Folder,
  Send,
  User,
  Globe,
  List,
  Bot,
  Sparkles,
  Boxes,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { analytics } from "@/shared/analytics/umami";
import type { Credential, CredentialField, CredentialType } from "@/shared/types/api";
import {
  createCredentialAction,
  listCredentialsAction,
  oauthStartAction,
  revealCredentialAction,
  updateCredentialAction,
} from "../actions";

// ---------------------------------------------------------------------------
// Icon map: registry icon string → lucide component
// ---------------------------------------------------------------------------

type LucideIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, LucideIconComponent> = {
  key: Key,
  shield: Shield,
  mail: Mail,
  table: Table,
  folder: Folder,
  send: Send,
  user: User,
  globe: Globe,
  list: List,
  bot: Bot,
  sparkles: Sparkles,
  boxes: Boxes,
};

function getTypeIcon(iconName: string | undefined): LucideIconComponent {
  if (!iconName) return Key;
  return ICON_MAP[iconName] ?? Key;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UNCHANGED_PLACEHOLDER = "••••••••";

function isMasked(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("••••");
}

// ---------------------------------------------------------------------------
// Step 1: Card grid type picker
// ---------------------------------------------------------------------------

function TypePicker({
  types,
  onSelect,
}: {
  types: CredentialType[];
  onSelect: (type: CredentialType) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = types.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Input
        type="text"
        name="credential-type-search"
        placeholder="Credential turi qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
      <div className="max-h-[320px] overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Hech narsa topilmadi
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((type) => {
              const Icon = getTypeIcon(type.icon);
              const color = type.color || undefined;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => onSelect(type)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-3 text-left",
                    "transition-colors hover:border-primary/40 hover:bg-muted/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"
                    style={color ? { backgroundColor: `${color}1A` } : undefined}
                  >
                    <Icon className="h-5 w-5" style={color ? { color } : undefined} />
                  </div>
                  <span className="line-clamp-2 text-[12px] font-medium leading-tight">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2a: Dynamic field renderer (reused inside DataForm)
// ---------------------------------------------------------------------------

interface FieldRendererProps {
  field: CredentialField;
  value: string;
  isEdit: boolean;
  onChange: (v: string) => void;
  showSecret: boolean;
  onToggleSecret: () => void;
  /** True while reveal API call is in-flight for this field */
  revealLoading?: boolean;
  /** Whether this field's value has already been revealed */
  revealed?: boolean;
}

function FieldRenderer({
  field,
  value,
  isEdit,
  onChange,
  showSecret,
  onToggleSecret,
  revealLoading,
  revealed,
}: FieldRendererProps) {
  if (field.type === "select" && field.options?.length) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={`cred-field-${field.name}`}>
          <SelectValue placeholder="Tanlang..." />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={`cred-field-${field.name}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        autoComplete="off"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
      />
    );
  }

  if (field.type === "password") {
    // In edit mode: if the value is empty (masked sentinel), the eye button should
    // trigger a reveal call first. After reveal the value is populated, so subsequent
    // eye clicks just toggle visibility.
    const isEmptyOrMasked = !value || isMasked(value);
    const needsReveal = isEdit && isEmptyOrMasked && !revealed;
    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            id={`cred-field-${field.name}`}
            type={showSecret ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isEdit && isEmptyOrMasked ? UNCHANGED_PLACEHOLDER : undefined}
            className="pr-10"
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-bwignore="true"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={onToggleSecret}
            disabled={revealLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            title={needsReveal ? "Qiymatni ko'rish uchun bosing" : showSecret ? "Yashirish" : "Ko'rsatish"}
          >
            {revealLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : showSecret ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {isEdit && isEmptyOrMasked && !revealed && (
          <p className="text-xs text-muted-foreground">
            Bo&apos;sh qolsa o&apos;zgarmaydi. Ko&apos;rish uchun ko&apos;z tugmasini bosing.
          </p>
        )}
        {isEdit && revealed && !showSecret && (
          <p className="text-xs text-muted-foreground">
            Qiymat ochildi. Saqlash uchun o&apos;zgartirmasangiz ham bo&apos;ladi.
          </p>
        )}
      </div>
    );
  }

  return (
    <Input
      id={`cred-field-${field.name}`}
      type={field.type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      data-1p-ignore="true"
      data-lpignore="true"
      data-bwignore="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Step 2a: Non-oauth data form
// ---------------------------------------------------------------------------

interface DataFormProps {
  type: CredentialType;
  name: string;
  onNameChange: (v: string) => void;
  fieldValues: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  showSecrets: Record<string, boolean>;
  onToggleSecret: (name: string) => void;
  /** Fields currently being revealed (spinner state) */
  revealLoadingFields: Record<string, boolean>;
  /** Fields whose value has already been fetched from reveal endpoint */
  revealedFields: Record<string, boolean>;
  isEdit: boolean;
  pending: boolean;
  onBack: (() => void) | null;
  onCancel: () => void;
  onSubmit: () => void;
}

function DataForm({
  type,
  name,
  onNameChange,
  fieldValues,
  onFieldChange,
  showSecrets,
  onToggleSecret,
  revealLoadingFields,
  revealedFields,
  isEdit,
  pending,
  onBack,
  onCancel,
  onSubmit,
}: DataFormProps) {
  return (
    <div className="space-y-4">
      {/* Credential name */}
      <div className="space-y-1.5">
        <Label htmlFor="cred-name">Nom</Label>
        <Input
          id="cred-name"
          name="credential-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Masalan: My ${type.label}`}
          autoFocus
          autoComplete="off"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
        />
      </div>

      {/* Dynamic fields */}
      {type.fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={`cred-field-${field.name}`}>
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          <FieldRenderer
            field={field}
            value={fieldValues[field.name] ?? ""}
            isEdit={isEdit}
            onChange={(v) => onFieldChange(field.name, v)}
            showSecret={showSecrets[field.name] ?? false}
            onToggleSecret={() => onToggleSecret(field.name)}
            revealLoading={revealLoadingFields[field.name] ?? false}
            revealed={revealedFields[field.name] ?? false}
          />
        </div>
      ))}

      <div className="flex items-center justify-between gap-2 pt-2">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} type="button">
            Orqaga
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Bekor qilish
          </Button>
          <Button onClick={onSubmit} disabled={pending} type="button">
            {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2b: OAuth2 connect panel
// ---------------------------------------------------------------------------

interface OAuthConnectProps {
  type: CredentialType;
  /** Existing account email when editing an oauth credential */
  accountEmail?: string | null;
  onSuccess: () => void;
  onBack: (() => void) | null;
  onCancel: () => void;
}

function OAuthConnect({
  type,
  accountEmail,
  onSuccess,
  onBack,
  onCancel,
}: OAuthConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Tear down listeners/timers/popup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const handleConnect = async () => {
    if (connecting || !type.provider) return;
    setConnecting(true);
    analytics.credentialOauthStart({ type: type.key });

    let settled = false;
    /** @param reason Nima uchun tugadi — muvaffaqiyatsiz holatlar uchun. */
    const finish = (ok: boolean, errMsg?: string | null, reason?: string) => {
      if (settled) return;
      settled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      setConnecting(false);
      if (ok) {
        analytics.credentialOauthDone({ type: type.key });
        // OAuth orqali yaratilgan credential ham umumiy "yaratildi" sanog'iga
        // kirishi kerak — aks holda Google/OAuth tiplari hisobotda yo'qoladi.
        analytics.credentialCreated({ type: type.key, via: "oauth" });
        toast.success("Muvaffaqiyatli ulandi");
        onSuccess();
      } else {
        // Bu tarmoqning eng jim joyi: quyidagi ikki holat (oynani yopdi /
        // 3 daqiqa kutdi) foydalanuvchiga ham, bizga ham hech nima ko'rsatmaydi.
        analytics.credentialOauthAbandoned({
          type: type.key,
          reason: reason ?? errMsg ?? "unknown",
        });
        if (errMsg) toast.error(errMsg);
      }
    };

    try {
      // Server Action fetches the authorize_url (keeps access token server-side)
      const res = await oauthStartAction(type.provider, type.key);
      if (!res.ok) {
        analytics.credentialCreateFailed({ type: type.key, reason: "oauth_start_failed" });
        toast.error(res.message ?? "OAuth boshlashda xatolik");
        setConnecting(false);
        return;
      }

      // Snapshot existing credentials of this type so we can detect the new/updated one.
      const snapshot = new Set<string>();
      try {
        const before = await listCredentialsAction({
          type_key: type.key,
          page: 1,
          page_size: 50,
        });
        before.results.forEach((c) => snapshot.add(`${c.id}:${c.updated_at}`));
      } catch {
        /* empty snapshot still works */
      }

      const popup = window.open(res.authorize_url, "oauth", "width=520,height=640");

      // Fast path: postMessage from the callback page. Google sets COOP on its consent
      // pages which severs window.opener, so this often never arrives — the poll below
      // is the reliable path.
      const handler = (e: MessageEvent) => {
        if (!e.data || e.data.type !== "credential-oauth") return;
        if (e.data.ok === true) finish(true);
        else
          finish(
            false,
            e.data.error ? `OAuth xatoligi: ${e.data.error}` : "OAuth ulashda xatolik",
            "callback_error",
          );
      };
      window.addEventListener("message", handler);

      // Reliable path: poll the backend until a credential for this type appears/updates.
      const poll = setInterval(async () => {
        try {
          const now = await listCredentialsAction({
            type_key: type.key,
            page: 1,
            page_size: 50,
          });
          if (now.results.some((c) => !snapshot.has(`${c.id}:${c.updated_at}`))) {
            finish(true);
          }
        } catch {
          /* keep polling */
        }
      }, 2500);

      // If the user closes the popup, give the poll a few cycles, then silently cancel.
      let graceTicks = 0;
      const closeWatch = setInterval(() => {
        if (popup?.closed && ++graceTicks >= 8) finish(false, null, "popup_closed");
      }, 500);

      const timeout = setTimeout(() => finish(false, null, "timeout"), 180000);

      cleanupRef.current = () => {
        window.removeEventListener("message", handler);
        clearInterval(poll);
        clearInterval(closeWatch);
        clearTimeout(timeout);
        try {
          popup?.close();
        } catch {
          /* close may be blocked — harmless */
        }
      };
    } catch {
      finish(false, "OAuth boshlanmadi");
    }
  };

  const Icon = getTypeIcon(type.icon);
  const isReconnect = Boolean(accountEmail);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-5 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-muted">
          <Icon className="h-7 w-7 text-foreground" />
        </div>

        {isReconnect ? (
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ulangan</span>
            </div>
            {accountEmail && (
              <p className="text-xs text-muted-foreground">{accountEmail}</p>
            )}
          </div>
        ) : (
          <p className="max-w-[260px] text-center text-sm text-muted-foreground">
            {type.label} ga ulanish uchun quyidagi tugmani bosing
          </p>
        )}

        <Button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          variant={isReconnect ? "outline" : "default"}
          className="gap-2"
        >
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isReconnect ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          {connecting
            ? "Kutilmoqda..."
            : isReconnect
              ? "Qayta ulash"
              : `${type.label} bilan ulash`}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} type="button">
            Orqaga
          </Button>
        ) : (
          <span />
        )}
        <Button variant="outline" onClick={onCancel} type="button">
          Yopish
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CredentialForm
// ---------------------------------------------------------------------------

interface CredentialFormProps {
  /** All available types from registry */
  types: CredentialType[];
  /** If provided, we're in edit mode */
  credential?: Credential;
  onSuccess: (credential?: Credential) => void;
  onCancel: () => void;
}

export function CredentialForm({
  types,
  credential,
  onSuccess,
  onCancel,
}: CredentialFormProps) {
  const isEdit = Boolean(credential);

  // step 1 = type picker (skipped in edit mode)
  // step 2 = data form OR oauth connect
  const [step, setStep] = useState<1 | 2>(isEdit ? 2 : 1);
  const [selectedType, setSelectedType] = useState<CredentialType | null>(
    () => (credential ? (types.find((t) => t.key === credential.type_key) ?? null) : null)
  );

  // Resolve type after types list loads (in case it wasn't ready initially)
  useEffect(() => {
    if (!selectedType && credential) {
      const matched = types.find((t) => t.key === credential.type_key) ?? null;
      if (matched) setSelectedType(matched);
    }
  }, [types, credential, selectedType]);

  const [name, setName] = useState(credential?.name ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    if (!credential) return {};
    const type = types.find((t) => t.key === credential.type_key);
    const init: Record<string, string> = {};
    for (const field of type?.fields ?? []) {
      if (field.secret || isMasked(credential.data[field.name])) {
        init[field.name] = ""; // empty = unchanged on edit
      } else {
        init[field.name] = String(credential.data[field.name] ?? field.default ?? "");
      }
    }
    return init;
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  /** Which password fields are currently being fetched from /reveal/ */
  const [revealLoadingFields, setRevealLoadingFields] = useState<Record<string, boolean>>({});
  /** Which password fields have already been revealed (value populated from API) */
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);

  const handleTypeSelect = (type: CredentialType) => {
    // Voronkaning birinchi ayrilishi: dialog ochib tip tanlamaganlarni
    // tip tanlab, formani to'ldira olmaganlardan ajratadi.
    analytics.credentialTypeSelected({ type: type.key });
    setSelectedType(type);
    // Pre-fill defaults
    const defaults: Record<string, string> = {};
    for (const field of type.fields) {
      defaults[field.name] = field.default != null ? String(field.default) : "";
    }
    setFieldValues(defaults);
    setStep(2);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleToggleSecret = async (fieldName: string) => {
    // If we're in edit mode and the value is empty/masked and not yet revealed,
    // fetch the decrypted value first, then flip to visible.
    if (isEdit && credential) {
      const currentValue = fieldValues[fieldName] ?? "";
      const alreadyRevealed = revealedFields[fieldName] ?? false;
      const isEmptyOrMasked = !currentValue || isMasked(currentValue);

      if (isEmptyOrMasked && !alreadyRevealed) {
        // Don't allow double-click while loading
        if (revealLoadingFields[fieldName]) return;

        setRevealLoadingFields((prev) => ({ ...prev, [fieldName]: true }));
        try {
          const res = await revealCredentialAction(credential.id);
          if (res.ok) {
            const decrypted = res.data[fieldName];
            if (decrypted !== undefined) {
              setFieldValues((prev) => ({ ...prev, [fieldName]: decrypted }));
              setRevealedFields((prev) => ({ ...prev, [fieldName]: true }));
              // Show the value immediately after reveal
              setShowSecrets((prev) => ({ ...prev, [fieldName]: true }));
            } else {
              // Field not in reveal response — just toggle visibility
              setShowSecrets((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
            }
          } else {
            toast.error(res.message ?? "Qiymatni ochib bo'lmadi");
          }
        } catch {
          toast.error("Qiymatni ochishda xatolik");
        } finally {
          setRevealLoadingFields((prev) => ({ ...prev, [fieldName]: false }));
        }
        return;
      }
    }

    // Normal toggle (new form, or already revealed value)
    setShowSecrets((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    if (!name.trim()) {
      analytics.credentialCreateFailed({ type: selectedType.key, reason: "validation:name" });
      toast.error("Nom kiriting");
      return;
    }
    // Validate required fields
    for (const field of selectedType.fields) {
      const val = fieldValues[field.name] ?? "";
      if (field.required && !val.trim()) {
        // On edit, empty secret = unchanged → ok
        if (isEdit && field.secret) continue;
        // Qaysi maydon to'ldirilmagani — formaning qaysi joyi tushunarsizligini
        // ko'rsatadi (bu yerda server'ga umuman bormaymiz).
        analytics.credentialCreateFailed({
          type: selectedType.key,
          reason: `validation:${field.name}`,
        });
        toast.error(`"${field.label}" majburiy`);
        return;
      }
    }

    setPending(true);
    try {
      // Build data payload — omit empty secret fields on edit (= unchanged)
      const data: Record<string, string> = {};
      for (const field of selectedType.fields) {
        const val = fieldValues[field.name] ?? "";
        if (isEdit && field.secret && !val.trim()) continue;
        if (val.trim() !== "") data[field.name] = val;
      }

      let result;
      if (isEdit && credential) {
        result = await updateCredentialAction(credential.id, { name: name.trim(), data });
      } else {
        result = await createCredentialAction({
          type_key: selectedType.key,
          name: name.trim(),
          data,
        });
      }

      if (result.ok && result.data) {
        toast.success(isEdit ? "Credential yangilandi" : "Credential yaratildi");
        if (isEdit) analytics.credentialUpdated({ type: selectedType.key });
        else analytics.credentialCreated({ type: selectedType.key });
        onSuccess(result.data as Credential);
      } else {
        if (!isEdit) {
          analytics.credentialCreateFailed({
            type: selectedType.key,
            reason: result.message ?? "unknown",
          });
        }
        toast.error(result.message ?? "Xatolik");
      }
    } finally {
      setPending(false);
    }
  };

  const handleOAuthSuccess = () => {
    onSuccess();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Step 1: card grid type picker
  if (step === 1) {
    return <TypePicker types={types} onSelect={handleTypeSelect} />;
  }

  // Step 2: waiting for type to resolve (edge case: edit before types loaded)
  if (!selectedType) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isOAuth2 = selectedType.mode === "oauth2";
  const accountEmail = isEdit ? (credential?.data?.account_email ?? null) : null;

  // Step 2b: OAuth connect
  if (isOAuth2) {
    return (
      <OAuthConnect
        type={selectedType}
        accountEmail={accountEmail}
        onSuccess={handleOAuthSuccess}
        onBack={isEdit ? null : handleBack}
        onCancel={onCancel}
      />
    );
  }

  // Step 2a: data form
  return (
    <DataForm
      type={selectedType}
      name={name}
      onNameChange={setName}
      fieldValues={fieldValues}
      onFieldChange={handleFieldChange}
      showSecrets={showSecrets}
      onToggleSecret={handleToggleSecret}
      revealLoadingFields={revealLoadingFields}
      revealedFields={revealedFields}
      isEdit={isEdit}
      pending={pending}
      onBack={isEdit ? null : handleBack}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
}
