"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { cmsCollectionHref } from "../lib/href";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Link } from "@/shared/i18n/routing";
import { deleteDocumentAction } from "../actions";
import { RelationValue } from "./relation-value";
import type { CmsCollection, CmsDocument, CmsField } from "@/shared/types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  collectionName: string;
  doc: CmsDocument | null;
  fields: CmsField[];
  collections?: CmsCollection[];
  onDeleted?: () => void;
};

function formatValue(value: unknown, kind: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (kind === "bool") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="text-xs">
        {value ? "true" : "false"}
      </Badge>
    );
  }

  if (kind === "datetime" || kind === "date") {
    try {
      const d = new Date(String(value));
      return (
        <span className="text-sm">
          {d.toLocaleDateString()} {kind === "datetime" ? d.toLocaleTimeString() : ""}
        </span>
      );
    } catch {
      return <span className="text-sm">{String(value)}</span>;
    }
  }

  if (kind === "image") {
    const url = String(value);
    return (
      <div className="space-y-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="max-h-40 max-w-full rounded-md border object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          {url.length > 60 ? url.slice(0, 60) + "…" : url}
        </a>
      </div>
    );
  }

  if (kind === "file" || kind === "audio" || kind === "video" || kind === "url") {
    const url = String(value);
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-xs text-blue-500 hover:underline break-all"
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        {url}
      </a>
    );
  }

  if (kind === "json" || kind === "array" || typeof value === "object") {
    let pretty: string;
    try {
      pretty = JSON.stringify(value, null, 2);
    } catch {
      pretty = String(value);
    }
    return (
      <pre className="rounded-md bg-muted/50 p-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-40">
        {pretty}
      </pre>
    );
  }

  const s = String(value);
  if (kind === "longtext") {
    return (
      <p className="text-sm whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{s}</p>
    );
  }

  return <span className="text-sm break-all">{s}</span>;
}

export function DocumentViewDrawer({
  open,
  onClose,
  projectId,
  collectionName,
  doc,
  fields,
  collections = [],
  onDeleted,
}: Props) {
  const t = useTranslations("cms");
  const router = useRouter();
  const [pending, start] = useTransition();

  if (!doc) return null;

  const docId = String(doc._id ?? "");

  const handleDelete = () => {
    if (!confirm(t("deleteDocConfirm"))) return;
    start(async () => {
      const res = await deleteDocumentAction({
        projectId,
        name: collectionName,
        id: docId,
      });
      if (!res.ok) {
        toast.error(res.message ?? "Xato");
        return;
      }
      toast.success("Hujjat o'chirildi");
      onClose();
      onDeleted?.();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("viewDocTitle")}
            <span className="font-mono text-xs text-muted-foreground font-normal">
              {docId.slice(-12)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* System field: _id */}
          <FieldRow label={t("fieldId")} kind="text">
            <span className="font-mono text-xs break-all">{docId}</span>
          </FieldRow>

          {/* Schema fields */}
          {fields.map((f) => (
            <FieldRow key={f.name} label={f.label || f.name} kind={f.kind}>
              {f.kind === "relation" ? (
                <RelationValue
                  projectId={projectId}
                  collections={collections}
                  relationCollectionId={f.relation_collection}
                  value={doc[f.name]}
                  serverLabel={doc._rel?.[f.name]}
                />
              ) : (
                formatValue(doc[f.name], f.kind)
              )}
            </FieldRow>
          ))}

          {/* System timestamps */}
          {doc._created_at && (
            <FieldRow label={t("fieldCreatedAt")} kind="datetime">
              {formatValue(doc._created_at, "datetime")}
            </FieldRow>
          )}
          {doc._updated_at && (
            <FieldRow label={t("fieldUpdatedAt")} kind="datetime">
              {formatValue(doc._updated_at, "datetime")}
            </FieldRow>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 mt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={pending}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("deleteDoc")}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("noValue")}
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link href={cmsCollectionHref(projectId, collectionName, `/data/${encodeURIComponent(docId)}`)}>
                <Pencil className="h-3.5 w-3.5" />
                {t("editDoc")}
              </Link>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  label,
  kind,
  children,
}: {
  label: string;
  kind: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b pb-2 last:border-0 last:pb-0">
      <div>
        <p className="text-xs font-medium truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground">{kind}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
