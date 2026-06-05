"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { updateDocumentAction } from "../actions";
import type { CmsCollection, CmsDocument, CmsField, CmsFieldKind } from "@/shared/types/api";
import { RelationSelect } from "./relation-select";

function initValue(kind: CmsFieldKind, raw: unknown): string | boolean {
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

function parseValue(k: CmsFieldKind, raw: string | boolean): unknown {
  if (k === "bool") return raw;
  const s = String(raw);
  if (!s) return undefined;
  if (k === "int") {
    const n = Number(s);
    return Number.isInteger(n) ? n : s;
  }
  if (k === "float") return Number(s);
  if (k === "json" || k === "array") {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }
  return s;
}

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
  collections: CmsCollection[];
  doc: CmsDocument;
};

export function DocumentEditForm({ projectId, collectionName, fields, collections, doc }: Props) {
  const router = useRouter();

  const initial: Record<string, string | boolean> = {};
  for (const f of fields) {
    initial[f.name] = initValue(f.kind, doc[f.name]);
  }

  const [values, setValues] = useState(initial);
  const [pending, start] = useTransition();

  const submit = () => {
    const patch: Record<string, unknown> = {};
    for (const f of fields) {
      const v = parseValue(f.kind, values[f.name]);
      if (v !== undefined && v !== "") patch[f.name] = v;
    }
    start(async () => {
      const res = await updateDocumentAction({
        projectId,
        name: collectionName,
        id: String(doc._id),
        patch,
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Hujjat saqlandi");
      router.push(`/app/bots/${projectId}/cms/${collectionName}/data`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.name} className="space-y-1">
          <label className="text-xs">
            <span className="font-medium">{f.label || f.name}</span>
            <span className="ml-2 text-muted-foreground">{f.kind}</span>
            {f.required && <span className="ml-1 text-destructive">*</span>}
          </label>
          {f.kind === "bool" ? (
            <Switch
              checked={Boolean(values[f.name])}
              onCheckedChange={(checked) => setValues({ ...values, [f.name]: checked })}
            />
          ) : f.kind === "longtext" || f.kind === "json" ? (
            <textarea
              value={String(values[f.name] ?? "")}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
            />
          ) : f.kind === "relation" ? (
            <RelationSelect
              projectId={projectId}
              collections={collections}
              field={f}
              value={String(values[f.name] ?? "")}
              onChange={(v) => setValues({ ...values, [f.name]: v })}
            />
          ) : (
            <Input
              type={f.kind === "int" || f.kind === "float" ? "number" : "text"}
              value={String(values[f.name] ?? "")}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => router.back()}>Bekor</Button>
        <Button onClick={submit} disabled={pending}>Saqlash</Button>
      </div>
    </div>
  );
}
