"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import type { Credential, CredentialType } from "@/shared/types/api";
import { createCredentialAction, updateCredentialAction } from "../actions";

interface CredentialFormProps {
  /** All available types from registry */
  types: CredentialType[];
  /** If provided, we're in edit mode */
  credential?: Credential;
  onSuccess: (credential: Credential) => void;
  onCancel: () => void;
}

const UNCHANGED_PLACEHOLDER = "••••••••";

export function CredentialForm({
  types,
  credential,
  onSuccess,
  onCancel,
}: CredentialFormProps) {
  const isEdit = Boolean(credential);

  // Step 1: pick a type (only shown when creating)
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>(
    credential?.type_key ?? ""
  );
  const [step, setStep] = useState<"type" | "fields">(
    isEdit ? "fields" : "type"
  );

  const selectedType = types.find((t) => t.key === selectedTypeKey);

  // Step 2: fill in fields
  const [name, setName] = useState(credential?.name ?? "");
  // For each field, store user input. Empty string for secret = unchanged on edit.
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    if (credential) {
      // Pre-fill with masked values from API; secret fields use empty string so
      // the placeholder "unchanged" hint shows.
      const init: Record<string, string> = {};
      for (const field of types.find((t) => t.key === credential.type_key)?.fields ?? []) {
        if (field.secret) {
          init[field.name] = ""; // empty = unchanged
        } else {
          init[field.name] = String(credential.data[field.name] ?? field.default ?? "");
        }
      }
      return init;
    }
    return {};
  });

  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);

  const handleTypeNext = () => {
    if (!selectedTypeKey) return;
    // Initialize field defaults
    const type = types.find((t) => t.key === selectedTypeKey);
    if (type) {
      const defaults: Record<string, string> = {};
      for (const field of type.fields) {
        defaults[field.name] = field.default != null ? String(field.default) : "";
      }
      setFieldValues(defaults);
    }
    setStep("fields");
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    if (!name.trim()) {
      toast.error("Nom kiriting");
      return;
    }
    // Validate required fields
    for (const field of selectedType.fields) {
      const val = fieldValues[field.name] ?? "";
      if (field.required && !isEdit && !val.trim()) {
        toast.error(`"${field.label}" majburiy`);
        return;
      }
      // On edit, if secret field is empty it's intentionally "unchanged" — ok
    }

    setPending(true);
    try {
      // Build data: for edit, omit empty secret fields (= unchanged)
      const data: Record<string, string> = {};
      for (const field of selectedType.fields) {
        const val = fieldValues[field.name] ?? "";
        if (isEdit && field.secret && !val.trim()) {
          continue; // omit = unchanged
        }
        if (val.trim() !== "") {
          data[field.name] = val;
        }
      }

      let result;
      if (isEdit && credential) {
        result = await updateCredentialAction(credential.id, { name: name.trim(), data });
      } else {
        result = await createCredentialAction({
          type_key: selectedTypeKey,
          name: name.trim(),
          data,
        });
      }

      if (result.ok && result.data) {
        toast.success(isEdit ? "Credential yangilandi" : "Credential yaratildi");
        onSuccess(result.data as Credential);
      } else {
        toast.error(result.message ?? "Xatolik");
      }
    } finally {
      setPending(false);
    }
  };

  // ── Step 1: type picker ─────────────────────────────────────────────────
  if (step === "type") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cred-type">Credential turi</Label>
          <Select value={selectedTypeKey} onValueChange={setSelectedTypeKey}>
            <SelectTrigger id="cred-type">
              <SelectValue placeholder="Turni tanlang…" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button onClick={handleTypeNext} disabled={!selectedTypeKey}>
            Davom etish
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: fields form ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="cred-name">Nom</Label>
        <Input
          id="cred-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Masalan: "My OpenAI key"'
          autoFocus
        />
      </div>

      {/* Dynamic fields */}
      {selectedType?.fields.map((field) => {
        const val = fieldValues[field.name] ?? "";
        const isVisible = showSecret[field.name] ?? false;

        const commonLabel = (
          <Label htmlFor={`cred-field-${field.name}`}>
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        );

        if (field.type === "select" && field.options) {
          return (
            <div key={field.name} className="space-y-2">
              {commonLabel}
              <Select
                value={val}
                onValueChange={(v) =>
                  setFieldValues((prev) => ({ ...prev, [field.name]: v }))
                }
              >
                <SelectTrigger id={`cred-field-${field.name}`}>
                  <SelectValue placeholder="Tanlang…" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.name} className="space-y-2">
              {commonLabel}
              <Textarea
                id={`cred-field-${field.name}`}
                value={val}
                onChange={(e) =>
                  setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                rows={3}
              />
            </div>
          );
        }

        if (field.type === "password") {
          return (
            <div key={field.name} className="space-y-2">
              {commonLabel}
              <div className="relative">
                <Input
                  id={`cred-field-${field.name}`}
                  type={isVisible ? "text" : "password"}
                  value={val}
                  onChange={(e) =>
                    setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={isEdit ? UNCHANGED_PLACEHOLDER : ""}
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setShowSecret((prev) => ({ ...prev, [field.name]: !isVisible }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Bo&apos;sh qolsa o&apos;zgarmaydi
                </p>
              )}
            </div>
          );
        }

        // text / number
        return (
          <div key={field.name} className="space-y-2">
            {commonLabel}
            <Input
              id={`cred-field-${field.name}`}
              type={field.type === "number" ? "number" : "text"}
              value={val}
              onChange={(e) =>
                setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
            />
          </div>
        );
      })}

      <div className="flex justify-between gap-2 pt-2">
        {!isEdit && (
          <Button variant="ghost" onClick={() => setStep("type")}>
            Orqaga
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
