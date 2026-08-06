"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { listRelationOptionsAction, getDocumentAction } from "../actions";
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
    if (collection.primary_field) {
      const v = doc[collection.primary_field];
      if (v !== null && v !== undefined) return String(v);
    }
    const textField = collection.fields?.find((f) => TEXT_KINDS.has(f.kind));
    if (textField) {
      const v = doc[textField.name];
      if (v !== null && v !== undefined) return String(v);
    }
  }
  return String(doc._id ?? "").slice(-8);
}

export function RelationSelect({ projectId, collections, field, value, onChange }: Props) {
  const targetCollection = field.relation_collection
    ? collections.find((c) => c.id === field.relation_collection)
    : null;

  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  const name = targetCollection?.name;

  // Loads one page. reset=true replaces the list (open/new search); otherwise
  // appends the next cursor page. A request id guards against out-of-order results.
  const load = useCallback(
    async (opts: { reset: boolean; search: string; cursor: string | null }) => {
      if (!name) return;
      const myReq = ++reqId.current;
      setLoading(true);
      const res = await listRelationOptionsAction({
        projectId,
        name,
        cursor: opts.reset ? null : opts.cursor,
        search: opts.search,
        limit: 30,
      });
      if (myReq !== reqId.current) return; // a newer request superseded this one
      if (res.ok) {
        setDocs((prev) => (opts.reset ? res.data.results : [...prev, ...res.data.results]));
        setCursor(res.data.next_cursor);
        setHasMore(res.data.next_cursor !== null);
      }
      setLoading(false);
    },
    [projectId, name]
  );

  // Resolve the selected value's human label (for the closed button). If the
  // doc isn't in the loaded page, fetch it by id.
  useEffect(() => {
    if (!targetCollection || !value) {
      setSelectedLabel("");
      return;
    }
    const inList = docs.find((d) => String(d._id) === String(value));
    if (inList) {
      setSelectedLabel(pickLabel(inList, targetCollection));
      return;
    }
    let cancelled = false;
    getDocumentAction({ projectId, name: targetCollection.name, id: String(value) }).then((r) => {
      if (!cancelled && r.ok) setSelectedLabel(pickLabel(r.data, targetCollection));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, name]);

  // Load on open and on (debounced) search change.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load({ reset: true, search, cursor: null }), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, search, load]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60 && hasMore && !loading) {
      load({ reset: false, search, cursor });
    }
  };

  // Free-form ID input when the referenced collection isn't resolvable.
  if (!targetCollection) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors"
        placeholder="ID kiriting…"
      />
    );
  }

  const select = (id: string, label: string) => {
    onChange(id);
    setSelectedLabel(label);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-left text-sm transition-colors hover:bg-accent/40"
      >
        <span className={value ? "truncate" : "truncate text-muted-foreground"}>
          {value ? selectedLabel || String(value).slice(-8) : "— tanlang —"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-md">
          <div className="flex items-center gap-2 border-b px-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish…"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div onScroll={onScroll} className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => select("", "")}
              className="block w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
            >
              — tozalash —
            </button>
            {docs.map((d) => (
              <button
                key={String(d._id)}
                type="button"
                onClick={() => select(String(d._id), pickLabel(d, targetCollection))}
                className={`block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-accent ${
                  String(d._id) === String(value) ? "bg-accent/60 font-medium" : ""
                }`}
              >
                {pickLabel(d, targetCollection)}
              </button>
            ))}
            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Yuklanmoqda…
              </div>
            )}
            {!loading && docs.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Hech narsa topilmadi</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
