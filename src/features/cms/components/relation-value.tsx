"use client";
import { useEffect, useState } from "react";
import { getDocumentAction } from "../actions";
import type { CmsCollection, CmsDocument } from "@/shared/types/api";

const TEXT_KINDS = new Set(["text", "longtext", "email", "url", "phone"]);

// Module-level cache so the same relation id is resolved once across all cells
// and across the list/detail views (key: "<collection>:<id>").
const labelCache = new Map<string, string>();

function pickLabel(doc: CmsDocument, collection: CmsCollection): string {
  if (collection.primary_field) {
    const v = doc[collection.primary_field];
    if (v !== null && v !== undefined) return String(v);
  }
  const textField = collection.fields?.find((f) => TEXT_KINDS.has(f.kind));
  if (textField) {
    const v = doc[textField.name];
    if (v !== null && v !== undefined) return String(v);
  }
  return String(doc._id ?? "").slice(-8);
}

/**
 * Renders a relation field value as the referenced document's primary_field
 * label (instead of the raw _id).
 *
 * The label is normally resolved server-side and passed via `serverLabel`
 * (the document's `_rel[field]` — batched, no flicker). The on-demand fetch
 * is only a fallback for responses that don't carry `_rel`.
 */
export function RelationValue({
  projectId,
  collections,
  relationCollectionId,
  value,
  serverLabel,
}: {
  projectId: string;
  collections: CmsCollection[];
  relationCollectionId: number | null | undefined;
  value: unknown;
  serverLabel?: string | string[] | null;
}) {
  const target = relationCollectionId
    ? collections.find((c) => c.id === relationCollectionId)
    : undefined;
  const id = value === null || value === undefined || value === "" ? "" : String(value);
  const key = target && id ? `${target.name}:${id}` : "";
  const resolved =
    serverLabel == null
      ? ""
      : Array.isArray(serverLabel)
      ? serverLabel.join(", ")
      : String(serverLabel);
  const [label, setLabel] = useState<string>(
    () => resolved || (key ? labelCache.get(key) ?? "" : "")
  );

  useEffect(() => {
    // Server already resolved the label — no client fetch needed.
    if (resolved) return;
    if (!target || !id) return;
    const k = `${target.name}:${id}`;
    const cached = labelCache.get(k);
    if (cached !== undefined) {
      setLabel(cached);
      return;
    }
    let cancelled = false;
    getDocumentAction({ projectId, name: target.name, id }).then((r) => {
      if (cancelled) return;
      const lbl = r.ok ? pickLabel(r.data, target) : id.slice(-8);
      labelCache.set(k, lbl);
      setLabel(lbl);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, target?.name, id, resolved]);

  if (!id) return <span className="text-muted-foreground">—</span>;
  const display = resolved || label;
  // Unresolvable relation target — show the raw id rather than nothing.
  if (!target && !display) return <span className="text-sm break-all">{id}</span>;
  return (
    <span className="text-sm" title={id}>
      {display || id.slice(-8)}
    </span>
  );
}
