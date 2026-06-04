"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { deleteDocumentAction, listDocumentsAction } from "../actions";
import type { CmsDocument, CmsField } from "@/shared/types/api";
import { ExcelExportButton } from "./excel-export";
import { ExcelImportButton } from "./excel-import";
import { DocumentViewDrawer } from "./document-view-drawer";

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
};

function renderCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
  const s = String(value);
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}

export function DataGrid({ projectId, collectionName, fields }: Props) {
  const router = useRouter();
  const t = useTranslations("cms");
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [filterRaw, setFilterRaw] = useState("");
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // View drawer state
  const [viewDoc, setViewDoc] = useState<CmsDocument | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const reload = () => {
    setLoading(true);
    setSelected(new Set());
    let filter: Record<string, unknown> | undefined;
    if (filterRaw.trim()) {
      try {
        filter = JSON.parse(filterRaw);
      } catch {
        toast.error("Filter JSON noto'g'ri");
        setLoading(false);
        return;
      }
    }
    listDocumentsAction({
      projectId,
      name: collectionName,
      filter,
      skip: page * limit,
      limit,
      sort: "-_created_at",
    })
      .then((res) => {
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setDocs(res.data.results);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleAll = () => {
    if (selected.size === docs.length) setSelected(new Set());
    else setSelected(new Set(docs.map((d) => String(d._id))));
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} ta hujjat o'chirilsinmi?`)) return;
    start(async () => {
      let ok = 0;
      let failed = 0;
      for (const id of selected) {
        const r = await deleteDocumentAction({ projectId, name: collectionName, id });
        if (r.ok) ok++;
        else failed++;
      }
      toast.success(`${ok} ta o'chirildi${failed ? `, ${failed} ta xato` : ""}`);
      reload();
      router.refresh();
    });
  };

  const openView = (doc: CmsDocument) => {
    setViewDoc(doc);
    setViewOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const cols = fields.slice(0, 8);

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={filterRaw}
            onChange={(e) => setFilterRaw(e.target.value)}
            placeholder='{"name": "John"} — MongoDB filter (JSON)'
            className="h-8 max-w-md font-mono text-xs"
          />
          <Button onClick={reload} variant="outline" size="sm">
            <RefreshCcw className="h-3.5 w-3.5" /> Yangilash
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <Button onClick={deleteSelected} variant="destructive" size="sm" disabled={pending}>
                <Trash2 className="h-3.5 w-3.5" /> {t("deleteDoc")} ({selected.size})
              </Button>
            )}
            {/* Excel Export */}
            <ExcelExportButton
              projectId={projectId}
              collectionName={collectionName}
              fields={fields}
            />
            {/* Excel Import */}
            <ExcelImportButton
              projectId={projectId}
              collectionName={collectionName}
              fields={fields}
              onImported={() => {
                reload();
                router.refresh();
              }}
            />
            <Button asChild size="sm">
              <a href={`/app/bots/${projectId}/cms/${collectionName}/data/new`} className="gap-1 flex items-center">
                <Plus className="h-3.5 w-3.5" /> Yangi
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th className="w-8 px-2 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={docs.length > 0 && selected.size === docs.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-2 py-2 text-left text-muted-foreground">_id</th>
                {cols.map((f) => (
                  <th key={f.name} className="px-2 py-2 text-left text-muted-foreground">
                    {f.label || f.name}
                    <span className="ml-1 text-[10px] text-muted-foreground/60">{f.kind}</span>
                  </th>
                ))}
                <th className="w-24 px-2 py-2 text-left text-muted-foreground">_created_at</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={cols.length + 3} className="py-10 text-center text-muted-foreground">
                    Yuklanmoqda…
                  </td>
                </tr>
              )}
              {!loading && docs.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 3} className="py-10 text-center text-muted-foreground">
                    Hujjatlar yo'q
                  </td>
                </tr>
              )}
              {docs.map((d) => {
                const id = String(d._id);
                return (
                  <tr
                    key={id}
                    className="border-t hover:bg-muted/20 cursor-pointer"
                    onClick={() => openView(d)}
                  >
                    <td
                      className="px-2 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() => toggle(id)}
                      />
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">
                      <span className="hover:underline cursor-pointer">
                        {id.slice(-8)}
                      </span>
                    </td>
                    {cols.map((f) => (
                      <td key={f.name} className="px-2 py-2 max-w-xs truncate">
                        {renderCell(d[f.name])}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-xs text-muted-foreground">
                      {(d._created_at as string)?.slice(0, 16) ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <Badge variant="secondary">{total} hujjat</Badge> · {page + 1}/{totalPages}
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              variant="ghost"
              size="sm"
              disabled={page === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              variant="ghost"
              size="sm"
              disabled={page + 1 >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document view drawer (as dialog) */}
      <DocumentViewDrawer
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewDoc(null); }}
        projectId={projectId}
        collectionName={collectionName}
        doc={viewDoc}
        fields={fields}
        onDeleted={() => reload()}
      />
    </>
  );
}
