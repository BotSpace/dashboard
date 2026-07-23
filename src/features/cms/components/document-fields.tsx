"use client";
import { ExternalLink, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import type { CmsCollection, CmsDocument, CmsField, CmsFieldKind } from "@/shared/types/api";
import { RelationSelect } from "./relation-select";

export type FieldValue = string | boolean;
export type FormValues = Record<string, FieldValue>;

// ─── Value (de)serialization ────────────────────────────────────────────────

export function defaultByKind(kind: CmsFieldKind, def?: unknown): FieldValue {
  if (kind === "bool") return Boolean(def ?? false);
  if (def === null || def === undefined) return "";
  if (kind === "json" || kind === "array") {
    try {
      return JSON.stringify(def, null, 2);
    } catch {
      return String(def);
    }
  }
  return String(def);
}

export function initValue(kind: CmsFieldKind, raw: unknown): FieldValue {
  if (kind === "bool") return Boolean(raw);
  if (raw === null || raw === undefined) return "";
  if (kind === "json" || kind === "array") {
    try {
      return JSON.stringify(raw, null, 2);
    } catch {
      return String(raw);
    }
  }
  return String(raw);
}

export function parseValue(kind: CmsFieldKind, raw: FieldValue): unknown {
  if (kind === "bool") return raw;
  const s = String(raw);
  if (!s) return undefined;
  if (kind === "int") {
    const n = Number(s);
    return Number.isInteger(n) ? n : s;
  }
  if (kind === "float") return Number(s);
  if (kind === "json" || kind === "array") {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }
  return s;
}

export function buildInitialValues(fields: CmsField[], doc?: CmsDocument): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    v[f.name] = doc ? initValue(f.kind, doc[f.name]) : defaultByKind(f.kind, f.default);
  }
  return v;
}

export function serializeValues(fields: CmsField[], values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = parseValue(f.kind, values[f.name]);
    if (v !== undefined && v !== "") out[f.name] = v;
  }
  return out;
}

/** Client-side validation: required + valid JSON. Returns {field: message}. */
export function validateFields(fields: CmsField[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = values[f.name];
    const isEmpty = f.kind === "bool" ? false : String(raw ?? "").trim() === "";
    if (f.required && isEmpty) {
      errors[f.name] = "Majburiy maydon";
      continue;
    }
    if (!isEmpty && (f.kind === "json" || f.kind === "array")) {
      try {
        JSON.parse(String(raw));
      } catch {
        errors[f.name] = f.kind === "array" ? "Noto'g'ri JSON massiv" : "Noto'g'ri JSON";
      }
    }
  }
  return errors;
}

// ─── Per-kind hints ─────────────────────────────────────────────────────────

function num(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}

function fieldHint(f: CmsField): string | null {
  const v = f.validators ?? {};
  const parts: string[] = [];
  const minL = num(v.min_length);
  const maxL = num(v.max_length);
  if (minL !== undefined && maxL !== undefined) parts.push(`${minL}–${maxL} belgi`);
  else if (maxL !== undefined) parts.push(`maks. ${maxL} belgi`);
  else if (minL !== undefined) parts.push(`min. ${minL} belgi`);
  const min = num(v.min);
  const max = num(v.max);
  if (min !== undefined && max !== undefined) parts.push(`${min} ≤ qiymat ≤ ${max}`);
  else if (max !== undefined) parts.push(`maks. ${max}`);
  else if (min !== undefined) parts.push(`min. ${min}`);
  return parts.length ? parts.join(" · ") : null;
}

function choicesOf(f: CmsField): string[] {
  const c = f.validators?.choices;
  return Array.isArray(c) ? c.map((x) => String(x)) : [];
}

// ─── Single field control ───────────────────────────────────────────────────

function FieldControl({
  field,
  value,
  onChange,
  projectId,
  collections,
  invalid,
  disabled,
}: {
  field: CmsField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  projectId: string;
  collections: CmsCollection[];
  invalid?: boolean;
  disabled?: boolean;
}) {
  const f = field;
  const str = String(value ?? "");
  const ring = invalid ? "border-destructive focus-visible:ring-destructive" : "";

  if (f.kind === "bool") {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
        <Switch checked={Boolean(value)} onCheckedChange={onChange} disabled={disabled} />
        <span className="text-sm text-muted-foreground">{value ? "Ha" : "Yo'q"}</span>
      </div>
    );
  }

  if (f.kind === "longtext") {
    return (
      <Textarea
        value={str}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        disabled={disabled}
        className={ring}
        placeholder={f.label || f.name}
      />
    );
  }

  if (f.kind === "json" || f.kind === "array") {
    return (
      <Textarea
        value={str}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        disabled={disabled}
        spellCheck={false}
        className={cn("font-mono text-xs", ring)}
        placeholder={f.kind === "array" ? "[]" : "{}"}
      />
    );
  }

  if (f.kind === "enum") {
    const choices = choicesOf(f);
    return (
      <div className="flex items-center gap-1.5">
        <Select value={str || undefined} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className={cn("flex-1", ring)}>
            <SelectValue placeholder="Tanlang…" />
          </SelectTrigger>
          <SelectContent>
            {choices.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!f.required && str && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent"
            aria-label="Tozalash"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (f.kind === "relation") {
    return (
      <RelationSelect
        projectId={projectId}
        collections={collections}
        field={f}
        value={str}
        onChange={onChange}
      />
    );
  }

  if (f.kind === "image") {
    return (
      <div className="space-y-2">
        <Input
          type="url"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://…"
          className={ring}
        />
        {str && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={str}
            alt=""
            className="max-h-32 rounded-md border object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>
    );
  }

  if (f.kind === "file" || f.kind === "audio" || f.kind === "video") {
    return (
      <div className="space-y-1">
        <Input
          type="url"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://…"
          className={ring}
        />
        {str && (
          <a
            href={str}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Ochish
          </a>
        )}
      </div>
    );
  }

  const inputType =
    f.kind === "int" || f.kind === "float"
      ? "number"
      : f.kind === "date"
      ? "date"
      : f.kind === "datetime"
      ? "datetime-local"
      : f.kind === "email"
      ? "email"
      : f.kind === "url"
      ? "url"
      : f.kind === "phone"
      ? "tel"
      : "text";

  return (
    <Input
      type={inputType}
      step={f.kind === "float" ? "any" : undefined}
      value={str}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={ring}
      placeholder={f.kind === "phone" ? "+998…" : undefined}
    />
  );
}

// ─── Field row (label + control + hint/error) ───────────────────────────────

export function DocumentFields({
  fields,
  values,
  setValue,
  projectId,
  collections,
  errors,
  disabled,
}: {
  fields: CmsField[];
  values: FormValues;
  setValue: (name: string, v: FieldValue) => void;
  projectId: string;
  collections: CmsCollection[];
  errors: Record<string, string>;
  disabled?: boolean;
}) {
  if (fields.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
        Bu collection&apos;da maydon yo&apos;q.
      </p>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
      {fields.map((f) => {
        const err = errors[f.name];
        const hint = fieldHint(f);
        const maxL = num(f.validators?.max_length);
        const showCount =
          (f.kind === "text" || f.kind === "longtext") && maxL !== undefined;
        const len = String(values[f.name] ?? "").length;
        return (
          <div key={f.name} className={cn("space-y-1.5", (f.kind === "longtext" || f.kind === "json" || f.kind === "array") && "md:col-span-2")}>
            <div className="flex items-baseline justify-between gap-2">
              <label className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{f.label || f.name}</span>
                {f.required && <span className="text-destructive">*</span>}
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-normal">
                  {f.kind}
                </Badge>
              </label>
              {showCount && (
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    len > (maxL as number) ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {len}/{maxL}
                </span>
              )}
            </div>

            <FieldControl
              field={f}
              value={values[f.name]}
              onChange={(v) => setValue(f.name, v)}
              projectId={projectId}
              collections={collections}
              invalid={Boolean(err)}
              disabled={disabled}
            />

            {err ? (
              <p className="text-xs text-destructive">{err}</p>
            ) : hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
