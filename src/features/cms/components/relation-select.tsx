"use client";
import { useEffect, useState } from "react";
import { listDocumentsAction } from "../actions";
import type { CmsCollection, CmsDocument, CmsField } from "@/shared/types/api";

type Props = {
  projectId: string;
  collections: CmsCollection[];
  field: CmsField;
  value: string;
  onChange: (v: string) => void;
};

const TEXT_KINDS = new Set(["text", "longtext", "email", "url", "phone"]);

function pickLabel(doc: CmsDocument, collection?: CmsCollection | null): string {
  if (collection) {
    // primary_field belgilangan bo'lsa — shuni birinchi sinab ko'r
    if (collection.primary_field) {
      const v = doc[collection.primary_field];
      if (v !== null && v !== undefined) return String(v);
    }
    // fallback: birinchi text-tipdagi maydon
    const textField = collection.fields?.find((f) => TEXT_KINDS.has(f.kind));
    if (textField) {
      const v = doc[textField.name];
      if (v !== null && v !== undefined) return String(v);
    }
  }
  return String(doc._id ?? "").slice(-8);
}

export function RelationSelect({ projectId, collections, field, value, onChange }: Props) {
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const targetCollection = field.relation_collection
    ? collections.find((c) => c.id === field.relation_collection)
    : null;

  useEffect(() => {
    if (!targetCollection) return;
    setLoading(true);
    listDocumentsAction({
      projectId,
      name: targetCollection.name,
      limit: 100,
      sort: "-_created_at",
    })
      .then((res) => {
        if (res.ok) setDocs(res.data.results);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, targetCollection?.name]);

  if (!targetCollection) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
        placeholder="ID kiriting…"
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:opacity-50"
    >
      <option value="">— tanlang —</option>
      {loading && <option disabled>Yuklanmoqda…</option>}
      {docs.map((doc) => (
        <option key={String(doc._id)} value={String(doc._id)}>
          {pickLabel(doc, targetCollection)}
        </option>
      ))}
    </select>
  );
}
