"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { insertDocumentAction } from "../actions";
import type { CmsCollection, CmsField, CmsFieldKind } from "@/shared/types/api";
import { RelationSelect } from "./relation-select";

function defaultByKind(k: CmsFieldKind): string | boolean {
  if (k === "bool") return false;
  return "";
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
};

export function DocumentForm({ projectId, collectionName, fields, collections }: Props) {
  const router = useRouter();
  const initial: Record<string, string | boolean> = {};
  for (const f of fields) initial[f.name] = defaultByKind(f.kind);
  const [values, setValues] = useState(initial);
  const [pending, start] = useTransition();

  const submit = () => {
    const document: Record<string, unknown> = {};
    for (const f of fields) {
      const v = parseValue(f.kind, values[f.name]);
      if (v !== undefined && v !== "") document[f.name] = v;
    }
    start(async () => {
      const res = await insertDocumentAction({ projectId, name: collectionName, document });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Hujjat qo'shildi");
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
            <input
              type="checkbox"
              checked={Boolean(values[f.name])}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
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
