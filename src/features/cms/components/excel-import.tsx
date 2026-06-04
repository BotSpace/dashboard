"use client";
import { useRef, useState, useTransition } from "react";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { bulkInsertDocumentsAction, insertDocumentAction } from "../actions";
import type { CmsField, CmsFieldKind } from "@/shared/types/api";

const BATCH = 20;
const PREVIEW_ROWS = 10;

type ColumnMap = Record<string, string | null>; // excelCol -> fieldName | null

function castValue(raw: unknown, kind: CmsFieldKind): unknown {
  if (raw === null || raw === undefined || raw === "") return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  switch (kind) {
    case "int": {
      const n = parseInt(s, 10);
      return isNaN(n) ? s : n;
    }
    case "float": {
      const n = parseFloat(s);
      return isNaN(n) ? s : n;
    }
    case "bool":
      return s === "true" || s === "1" || s === "yes" || s === "ha";
    case "datetime":
    case "date": {
      // Excel may pass serial number or ISO string
      if (typeof raw === "number") {
        // Excel serial date → JS Date
        const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
        return d.toISOString();
      }
      return s;
    }
    case "json":
    case "array":
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    default:
      return s;
  }
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, "_");
}

function matchColumns(excelHeaders: string[], fields: CmsField[]): ColumnMap {
  const map: ColumnMap = {};
  for (const col of excelHeaders) {
    const norm = normalizeHeader(col);
    const match = fields.find(
      (f) =>
        normalizeHeader(f.name) === norm ||
        (f.label && normalizeHeader(f.label) === norm)
    );
    map[col] = match ? match.name : null;
  }
  return map;
}

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
  onImported?: () => void;
};

type ParsedSheet = {
  headers: string[];
  rows: Record<string, unknown>[];
};

async function parseFile(file: File): Promise<ParsedSheet> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  const headers = json.length > 0 ? Object.keys(json[0]) : [];
  return { headers, rows: json };
}

export function ExcelImportButton({ projectId, collectionName, fields, onImported }: Props) {
  const t = useTranslations("cms");
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [colMap, setColMap] = useState<ColumnMap>({});
  const [pending, start] = useTransition();
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ row: number; msg: string }[]>([]);
  const [done, setDone] = useState<number | null>(null);

  const reset = () => {
    setSheet(null);
    setColMap({});
    setErrors([]);
    setDone(null);
    setProgressText(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseFile(file);
      setSheet(parsed);
      setColMap(matchColumns(parsed.headers, fields));
      setErrors([]);
      setDone(null);
      setOpen(true);
    } catch {
      toast.error(t("importError"));
    }
  };

  const mappedCount = Object.values(colMap).filter(Boolean).length;
  const unmapped = Object.entries(colMap)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  const handleImport = () => {
    if (!sheet) return;
    start(async () => {
      const rowErrors: { row: number; msg: string }[] = [];
      let okCount = 0;

      // Build documents from mapped columns
      const docs = sheet.rows.map((row, i): { idx: number; doc: Record<string, unknown> } => {
        const doc: Record<string, unknown> = {};
        for (const [col, fieldName] of Object.entries(colMap)) {
          if (!fieldName) continue;
          const field = fields.find((f) => f.name === fieldName);
          if (!field) continue;
          const casted = castValue(row[col], field.kind);
          if (casted !== undefined) doc[fieldName] = casted;
        }
        return { idx: i + 2, doc }; // +2: header row + 1-based
      });

      // Try bulk insert first (backend has it)
      const allDocs = docs.map((d) => d.doc);
      const bulkResult = await bulkInsertDocumentsAction({
        projectId,
        name: collectionName,
        documents: allDocs,
      });

      if (bulkResult.ok) {
        okCount = bulkResult.count;
        setDone(okCount);
        setErrors([]);
        const failedCount = allDocs.length - okCount;
        toast.success(
          t("importDone", {
            ok: okCount,
            failed: failedCount > 0 ? t("importFailed", { n: failedCount }) : "",
          })
        );
        onImported?.();
        return;
      }

      // Fallback: insert one by one in batches
      for (let i = 0; i < docs.length; i += BATCH) {
        const batch = docs.slice(i, i + BATCH);
        setProgressText(t("importProgress", { done: i, total: docs.length }));
        for (const { idx, doc } of batch) {
          const res = await insertDocumentAction({
            projectId,
            name: collectionName,
            document: doc,
          });
          if (res.ok) {
            okCount++;
          } else {
            rowErrors.push({ row: idx, msg: res.message ?? "error" });
          }
        }
      }

      setProgressText(null);
      setDone(okCount);
      setErrors(rowErrors);

      const failedCount = rowErrors.length;
      toast.success(
        t("importDone", {
          ok: okCount,
          failed: failedCount > 0 ? t("importFailed", { n: failedCount }) : "",
        })
      );
      onImported?.();
    });
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.csv,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        className="gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" />
        {t("import")}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); } setOpen(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("import")}</DialogTitle>
          </DialogHeader>

          {sheet && done === null && (
            <div className="space-y-4">
              {/* Column mapping */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("importMapping")} — {mappedCount}/{sheet.headers.length}
                </p>
                <div className="rounded-md border divide-y text-sm">
                  {sheet.headers.map((col) => {
                    const mapped = colMap[col];
                    const field = mapped ? fields.find((f) => f.name === mapped) : null;
                    return (
                      <div key={col} className="flex items-center gap-2 px-3 py-2">
                        <span className="font-mono text-xs w-1/3 truncate">{col}</span>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex-1">
                          <select
                            className="w-full rounded border bg-background px-2 py-1 text-xs"
                            value={mapped ?? ""}
                            onChange={(e) =>
                              setColMap({ ...colMap, [col]: e.target.value || null })
                            }
                          >
                            <option value="">— {t("noValue")}</option>
                            {fields.map((f) => (
                              <option key={f.name} value={f.name}>
                                {f.label || f.name} ({f.kind})
                              </option>
                            ))}
                          </select>
                        </div>
                        {field ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {unmapped.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("importUnmapped")}: {unmapped.join(", ")}
                  </p>
                )}
              </div>

              {/* Preview table */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t("importPreview", { count: sheet.rows.length })}
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr>
                        {sheet.headers
                          .filter((h) => colMap[h])
                          .map((h) => (
                            <th key={h} className="px-2 py-1.5 text-left text-muted-foreground truncate max-w-[120px]">
                              {h}
                              <span className="ml-1 text-[10px] text-muted-foreground/60">
                                → {colMap[h]}
                              </span>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                        <tr key={i} className="border-t">
                          {sheet.headers
                            .filter((h) => colMap[h])
                            .map((h) => (
                              <td key={h} className="px-2 py-1 max-w-[120px] truncate">
                                {row[h] === null || row[h] === undefined || row[h] === ""
                                  ? <span className="text-muted-foreground">—</span>
                                  : String(row[h])}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sheet.rows.length > PREVIEW_ROWS && (
                  <p className="text-xs text-muted-foreground mt-1">
                    … va {sheet.rows.length - PREVIEW_ROWS} ta boshqa qator
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {pending && progressText && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              {progressText}
            </div>
          )}

          {/* Done state */}
          {done !== null && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  {t("importDone", {
                    ok: done,
                    failed: errors.length > 0 ? t("importFailed", { n: errors.length }) : "",
                  })}
                </span>
              </div>
              {errors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t("importErrors")}
                  </p>
                  <div className="rounded-md border divide-y max-h-40 overflow-y-auto">
                    {errors.map((e) => (
                      <div key={e.row} className="flex items-start gap-2 px-3 py-1.5 text-xs">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <span>
                          <span className="font-mono">Row {e.row}:</span> {e.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="sm" onClick={reset}>
                {done !== null ? "Yopish" : t("importSelectFile").split(".")[0]}
              </Button>
            </DialogClose>
            {done === null && sheet && (
              <Button
                size="sm"
                onClick={handleImport}
                disabled={pending || mappedCount === 0}
              >
                {pending
                  ? progressText ?? "…"
                  : t("importConfirm") + ` (${sheet.rows.length})`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
