"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadMoreTemplatesAction } from "@/features/templates/actions";
import type { TemplateListParams } from "@/shared/api/services";
import type { Template } from "@/shared/types/api";
import { TemplateCard } from "./template-card";

interface Props {
  initialItems: Template[];
  baseParams: TemplateListParams;
  startPage: number;
  initialHasMore: boolean;
  locale: string;
  freeLabel: string;
  basePath?: string;
  gridClassName?: string;
  ownedLabel?: string;
}

const DEFAULT_GRID_CLASS = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

export function TemplatesInfiniteLoader({
  initialItems,
  baseParams,
  startPage,
  initialHasMore,
  locale,
  freeLabel,
  basePath,
  gridClassName = DEFAULT_GRID_CLASS,
  ownedLabel,
}: Props) {
  // Single source of truth: initial server-rendered items + everything
  // appended by the infinite-scroll loader. Rendering both groups in
  // the SAME grid container avoids the "ragged row" gap that appeared
  // when each page lived in its own grid.
  const [items, setItems] = useState<Template[]>(initialItems);
  const [page, setPage] = useState(startPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  // Reset when the filter changes (parent re-renders with a new initial
  // page). Comparing by length + first id + startPage is cheap and avoids
  // resetting the loader on identical re-renders.
  const initialKey = `${initialItems.length}:${initialItems[0]?.id ?? ""}:${startPage}`;
  useEffect(() => {
    setItems(initialItems);
    setPage(startPage);
    setHasMore(initialHasMore);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const loadNext = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const result = await loadMoreTemplatesAction({ ...baseParams, page: nextPage });
      if (result.items.length === 0) {
        setHasMore(false);
        return;
      }
      setItems((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklashda xatolik");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [baseParams, hasMore, page]);

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNext();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNext]);

  return (
    <>
      <div className={gridClassName}>
        {items.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            locale={locale}
            freeLabel={freeLabel}
            basePath={basePath}
            ownedLabel={ownedLabel}
          />
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Yuklanmoqda…</span>
        </div>
      )}
      {error && !loading && (
        <div className="py-4 text-center text-sm text-destructive">
          {error}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              setHasMore(true);
              loadNext();
            }}
          >
            qaytadan urinish
          </button>
        </div>
      )}
    </>
  );
}
