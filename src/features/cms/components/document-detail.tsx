"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/routing";
import { deleteDocumentAction } from "../actions";
import { cmsCollectionHref } from "../lib/href";
import { RelationValue } from "./relation-value";
import type { CmsCollection, CmsDocument, CmsField } from "@/shared/types/api";

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
  collections: CmsCollection[];
  doc: CmsDocument;
};

function formatValue(value: unknown, kind: string): React.ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  if (kind === "bool") return <Badge variant={value ? "default" : "secondary"}>{value ? "true" : "false"}</Badge>;
  if (kind === "datetime" || kind === "date") {
    const date = new Date(String(value));
    return <span>{Number.isNaN(date.getTime()) ? String(value) : `${date.toLocaleDateString()} ${kind === "datetime" ? date.toLocaleTimeString() : ""}`}</span>;
  }
  if (kind === "image") {
    const url = String(value);
    return <div className="space-y-2"><img src={url} alt="" className="max-h-48 max-w-full rounded-lg border object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} /><a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 break-all text-xs font-medium text-foreground hover:underline"><ExternalLink className="h-3 w-3 shrink-0" />{url}</a></div>;
  }
  if (kind === "file" || kind === "audio" || kind === "video" || kind === "url") {
    const url = String(value);
    return <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 break-all text-sm font-medium text-foreground hover:underline"><ExternalLink className="h-3 w-3 shrink-0" />{url}</a>;
  }
  if (kind === "json" || kind === "array" || typeof value === "object") {
    let pretty = String(value);
    try { pretty = JSON.stringify(value, null, 2); } catch { /* fallback to string */ }
    return <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted/60 p-3 text-xs font-mono">{pretty}</pre>;
  }
  return <span className={kind === "longtext" ? "whitespace-pre-wrap break-words" : "break-all"}>{String(value)}</span>;
}

function DetailRow({ label, kind, children }: { label: string; kind: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border/60 py-4 last:border-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{kind}</p>
      </div>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  );
}

export function DocumentDetail({ projectId, collectionName, fields, collections, doc }: Props) {
  const t = useTranslations("cms");
  const router = useRouter();
  const [pending, start] = useTransition();
  const docId = String(doc._id ?? "");
  const dataHref = cmsCollectionHref(projectId, collectionName, "/data");
  const editHref = cmsCollectionHref(projectId, collectionName, `/data/${encodeURIComponent(docId)}/edit`);

  const handleDelete = () => {
    if (!confirm(t("deleteDocConfirm"))) return;
    start(async () => {
      const result = await deleteDocumentAction({ projectId, name: collectionName, id: docId });
      if (!result.ok) { toast.error(result.message ?? "Xato"); return; }
      toast.success(t("deleteDocSuccess"));
      router.push(dataHref);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("fieldId")}</p>
          <p className="mt-1 truncate font-mono text-sm">{docId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={dataHref}><ArrowLeftIcon />{t("backToData")}</Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href={editHref}><Pencil className="h-3.5 w-3.5" />{t("editDoc")}</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />{t("deleteDoc")}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-4 sm:px-5">
        <DetailRow label={t("fieldId")} kind="text"><span className="break-all font-mono text-xs">{docId}</span></DetailRow>
        {fields.map((field) => (
          <DetailRow key={field.name} label={field.label || field.name} kind={field.kind}>
            {field.kind === "relation" ? <RelationValue projectId={projectId} collections={collections} relationCollectionId={field.relation_collection} value={doc[field.name]} serverLabel={doc._rel?.[field.name]} /> : formatValue(doc[field.name], field.kind)}
          </DetailRow>
        ))}
        {doc._created_at && <DetailRow label={t("fieldCreatedAt")} kind="datetime">{formatValue(doc._created_at, "datetime")}</DetailRow>}
        {doc._updated_at && <DetailRow label={t("fieldUpdatedAt")} kind="datetime">{formatValue(doc._updated_at, "datetime")}</DetailRow>}
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return <span aria-hidden="true">←</span>;
}
