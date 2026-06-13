"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCcw,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { deleteDocumentAction, listDocumentsAction } from "../actions";
import type { CmsCollection, CmsDocument, CmsField } from "@/shared/types/api";
import { ExcelExportButton } from "./excel-export";
import { ExcelImportButton } from "./excel-import";
import { DocumentViewDrawer } from "./document-view-drawer";
import { RelationValue } from "./relation-value";

// ─── Filter types ──────────────────────────────────────────────────────────

type FilterOperator =
  | "contains"
  | "eq"
  | "ne"
  | "gte"
  | "lte"
  | "regex"
  | "bool_true"
  | "bool_false"
  | "bool_all"
  | "date_gte"
  | "date_lte";

type FilterRow = {
  id: number;
  field: string;
  operator: FilterOperator;
  value: string;
};

const operatorLabel: Record<FilterOperator, string> = {
  contains: "o'z ichiga oladi",
  eq: "teng",
  ne: "teng emas",
  gte: "dan katta (≥)",
  lte: "dan kichik (≤)",
  regex: "regex",
  bool_true: "Ha",
  bool_false: "Yo'q",
  bool_all: "Hammasi",
  date_gte: "dan keyin (≥)",
  date_lte: "gacha (≤)",
};

function getOperatorsForKind(kind: string): FilterOperator[] {
  switch (kind) {
    case "int":
    case "float":
      return ["eq", "ne", "gte", "lte"];
    case "bool":
      return ["bool_all", "bool_true", "bool_false"];
    case "date":
    case "datetime":
      return ["date_gte", "date_lte", "eq"];
    default:
      return ["contains", "eq", "ne", "regex"];
  }
}

function buildMongoFilter(rows: FilterRow[], fields: CmsField[]): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [];
  for (const row of rows) {
    if (!row.field) continue;
    const { field, operator, value } = row;
    const kind = fields.find((f) => f.name === field)?.kind;
    const isNumeric = kind === "int" || kind === "float";
    if (operator === "bool_all") continue;
    if (operator === "bool_true") {
      conditions.push({ [field]: true });
      continue;
    }
    if (operator === "bool_false") {
      conditions.push({ [field]: false });
      continue;
    }
    if (!value.trim()) continue;
    if (operator === "contains") {
      conditions.push({ [field]: { $regex: value, $options: "i" } });
    } else if (operator === "regex") {
      conditions.push({ [field]: { $regex: value, $options: "i" } });
    } else if (operator === "eq") {
      conditions.push({ [field]: isNumeric ? Number(value) : value });
    } else if (operator === "ne") {
      conditions.push({ [field]: { $ne: isNumeric ? Number(value) : value } });
    } else if (operator === "gte") {
      conditions.push({ [field]: { $gte: Number(value) } });
    } else if (operator === "lte") {
      conditions.push({ [field]: { $lte: Number(value) } });
    } else if (operator === "date_gte") {
      conditions.push({ [field]: { $gte: value } });
    } else if (operator === "date_lte") {
      conditions.push({ [field]: { $lte: value } });
    }
  }
  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}

// ─── Filter chip ──────────────────────────────────────────────────────────

function FilterChip({
  row,
  fields,
  onRemove,
}: {
  row: FilterRow;
  fields: CmsField[];
  onRemove: () => void;
}) {
  const f = fields.find((x) => x.name === row.field);
  const label = f?.label || row.field;
  const opLabel = operatorLabel[row.operator] ?? row.operator;
  const text =
    row.operator === "bool_true"
      ? `${label}: Ha`
      : row.operator === "bool_false"
      ? `${label}: Yo'q`
      : `${label} ${opLabel}${row.value ? ` "${row.value}"` : ""}`;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium">
      {text}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-accent"
        aria-label="Filterni olib tashlash"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────

let _rowIdCounter = 0;
const nextRowId = () => ++_rowIdCounter;

function FilterPanel({
  fields,
  rows,
  onRowsChange,
  onClear,
}: {
  fields: CmsField[];
  rows: FilterRow[];
  onRowsChange: (rows: FilterRow[]) => void;
  onClear: () => void;
}) {
  const addRow = () => {
    const firstField = fields[0];
    if (!firstField) return;
    const ops = getOperatorsForKind(firstField.kind);
    onRowsChange([
      ...rows,
      { id: nextRowId(), field: firstField.name, operator: ops[0], value: "" },
    ]);
  };

  const updateRow = (id: number, patch: Partial<FilterRow>) => {
    onRowsChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...patch };
        // reset operator when field changes
        if (patch.field && patch.field !== r.field) {
          const f = fields.find((x) => x.name === patch.field);
          const ops = getOperatorsForKind(f?.kind ?? "text");
          updated.operator = ops[0];
          updated.value = "";
        }
        return updated;
      })
    );
  };

  const removeRow = (id: number) => {
    onRowsChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">Filter shartlari (AND)</span>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Tozalash
          </button>
        )}
      </div>

      {rows.length === 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">
          Hozircha shart yo'q
        </div>
      )}

      <div className="space-y-1.5">
        {rows.map((row) => {
          const fieldDef = fields.find((x) => x.name === row.field);
          const ops = getOperatorsForKind(fieldDef?.kind ?? "text");
          const isBool = fieldDef?.kind === "bool";
          const isNumeric = fieldDef?.kind === "int" || fieldDef?.kind === "float";
          const isDate = fieldDef?.kind === "date" || fieldDef?.kind === "datetime";

          return (
            <div key={row.id} className="flex flex-wrap items-center gap-1.5">
              {/* Field select */}
              <select
                value={row.field}
                onChange={(e) => updateRow(row.id, { field: e.target.value })}
                className="h-7 rounded-md border bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-2 text-xs"
              >
                {fields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label || f.name}
                  </option>
                ))}
              </select>

              {/* Operator select */}
              <select
                value={row.operator}
                onChange={(e) => updateRow(row.id, { operator: e.target.value as FilterOperator })}
                className="h-7 rounded-md border bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground px-2 text-xs"
              >
                {ops.map((op) => (
                  <option key={op} value={op}>
                    {operatorLabel[op]}
                  </option>
                ))}
              </select>

              {/* Value input — depends on type */}
              {!isBool && row.operator !== "bool_all" && (
                <>
                  {isDate ? (
                    <Input
                      type={fieldDef?.kind === "datetime" ? "datetime-local" : "date"}
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      className="h-7 w-40 text-xs"
                    />
                  ) : isNumeric ? (
                    <Input
                      type="number"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      placeholder="qiymat"
                      className="h-7 w-28 text-xs"
                    />
                  ) : (
                    <Input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      placeholder="qiymat"
                      className="h-7 w-40 text-xs"
                    />
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded p-0.5 hover:bg-accent"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Shart qo'shish
      </button>
    </div>
  );
}

// ─── Cell renderer ─────────────────────────────────────────────────────────

function renderCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
  const s = String(value);
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}

// ─── DataGrid ──────────────────────────────────────────────────────────────

type Props = {
  projectId: string;
  collectionName: string;
  fields: CmsField[];
  collections?: CmsCollection[];
};

export function DataGrid({ projectId, collectionName, fields, collections = [] }: Props) {
  const router = useRouter();
  const t = useTranslations("cms");
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Filter state ──────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState<"visual" | "advanced">("visual");
  const [filterRows, setFilterRows] = useState<FilterRow[]>([]);
  const [filterRaw, setFilterRaw] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // ── View drawer ───────────────────────────────────────────────────────
  const [viewDoc, setViewDoc] = useState<CmsDocument | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target as Node)
      ) {
        setFilterPanelOpen(false);
      }
    };
    if (filterPanelOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterPanelOpen]);

  const buildFilter = (): Record<string, unknown> | undefined => {
    if (filterMode === "advanced") {
      if (!filterRaw.trim()) return undefined;
      try {
        return JSON.parse(filterRaw);
      } catch {
        toast.error("Filter JSON noto'g'ri");
        return null as unknown as undefined; // signal error
      }
    }
    const f = buildMongoFilter(filterRows, fields);
    return Object.keys(f).length > 0 ? f : undefined;
  };

  const reload = () => {
    setLoading(true);
    setSelected(new Set());

    const filter = buildFilter();
    // null means parse error — already toasted
    if (filter === (null as unknown as undefined) && filterMode === "advanced") {
      setLoading(false);
      return;
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

  const applyFilter = () => {
    if (page !== 0) {
      setPage(0); // triggers reload via useEffect
    } else {
      reload();
    }
    setFilterPanelOpen(false);
  };

  const clearFilter = () => {
    setFilterRows([]);
    setFilterRaw("");
    if (page !== 0) {
      setPage(0);
    } else {
      reload();
    }
  };

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
  const activeFilterCount =
    filterMode === "visual"
      ? filterRows.filter((r) => r.operator !== "bool_all").length
      : filterRaw.trim()
      ? 1
      : 0;

  return (
    <>
      <div className="space-y-3">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-start gap-2">
          {/* Filter button + panel */}
          <div className="relative" ref={filterPanelRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterPanelOpen((v) => !v)}
              className="gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {filterPanelOpen && (
              <div className="absolute left-0 top-full z-30 mt-1">
                <div className="rounded-md border bg-background p-3 shadow-md min-w-[540px] space-y-3">
                  {/* Mode toggle */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setFilterMode("visual")}
                        className={`px-2 py-0.5 rounded ${
                          filterMode === "visual"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Vizual
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode("advanced")}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                          filterMode === "advanced"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        Advanced (JSON)
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilterPanelOpen(false)}
                      className="rounded p-0.5 hover:bg-accent"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Visual mode */}
                  {filterMode === "visual" && (
                    <FilterPanel
                      fields={fields}
                      rows={filterRows}
                      onRowsChange={setFilterRows}
                      onClear={() => setFilterRows([])}
                    />
                  )}

                  {/* Advanced JSON mode */}
                  {filterMode === "advanced" && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        MongoDB filter (JSON)
                      </label>
                      <textarea
                        value={filterRaw}
                        onChange={(e) => setFilterRaw(e.target.value)}
                        placeholder={'{"name": "John"}'}
                        rows={4}
                        className="w-full rounded-md border bg-transparent px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  )}

                  {/* Apply */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <button
                      type="button"
                      onClick={clearFilter}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Tozalash
                    </button>
                    <Button size="sm" onClick={applyFilter}>
                      Qo'llash
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {filterMode === "visual" && filterRows.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {filterRows.map((row) => (
                <FilterChip
                  key={row.id}
                  row={row}
                  fields={fields}
                  onRemove={() => {
                    const next = filterRows.filter((r) => r.id !== row.id);
                    setFilterRows(next);
                    // auto-reload when chip removed
                    setTimeout(() => {
                      const f = buildMongoFilter(next, fields);
                      setLoading(true);
                      setSelected(new Set());
                      listDocumentsAction({
                        projectId,
                        name: collectionName,
                        filter: Object.keys(f).length > 0 ? f : undefined,
                        skip: 0,
                        limit,
                        sort: "-_created_at",
                      })
                        .then((res) => {
                          if (!res.ok) { toast.error(res.message); return; }
                          setPage(0);
                          setDocs(res.data.results);
                          setTotal(res.data.total);
                        })
                        .finally(() => setLoading(false));
                    }, 0);
                  }}
                />
              ))}
            </div>
          )}

          {filterMode === "advanced" && filterRaw.trim() && (
            <Badge variant="outline" className="text-xs font-mono">
              JSON filter faol
            </Badge>
          )}

          <Button onClick={reload} variant="outline" size="sm">
            <RefreshCcw className="h-3.5 w-3.5" /> Yangilash
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <Button onClick={deleteSelected} variant="destructive" size="sm" disabled={pending}>
                <Trash2 className="h-3.5 w-3.5" /> {t("deleteDoc")} ({selected.size})
              </Button>
            )}
            <ExcelExportButton
              projectId={projectId}
              collectionName={collectionName}
              fields={fields}
            />
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
              <a
                href={`/app/bots/${projectId}/cms/${collectionName}/data/new`}
                className="gap-1 flex items-center"
              >
                <Plus className="h-3.5 w-3.5" /> Yangi
              </a>
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
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
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() => toggle(id)}
                      />
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">
                      <span className="hover:underline cursor-pointer">{id.slice(-8)}</span>
                    </td>
                    {cols.map((f) => (
                      <td key={f.name} className="px-2 py-2 max-w-xs truncate">
                        {f.kind === "relation" ? (
                          <RelationValue
                            projectId={projectId}
                            collections={collections}
                            relationCollectionId={f.relation_collection}
                            value={d[f.name]}
                            serverLabel={d._rel?.[f.name]}
                          />
                        ) : (
                          renderCell(d[f.name])
                        )}
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

        {/* ── Pagination ── */}
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

      {/* Document view drawer */}
      <DocumentViewDrawer
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewDoc(null);
        }}
        projectId={projectId}
        collectionName={collectionName}
        doc={viewDoc}
        fields={fields}
        collections={collections}
        onDeleted={() => reload()}
      />
    </>
  );
}
