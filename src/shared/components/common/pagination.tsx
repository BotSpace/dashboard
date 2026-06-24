"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Page-based pagination — preserves existing query params, sets `page`. */
export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  if (!totalPages || totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  const delta = 2;
  const pages: number[] = [];
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm transition-colors hover:bg-muted";
  const ellipsis = <span className="px-1 text-muted-foreground">…</span>;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-3" aria-label="Pagination">
      <Link
        href={href(Math.max(1, currentPage - 1))}
        aria-label="Oldingi"
        className={cn(base, currentPage <= 1 && "pointer-events-none opacity-40")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages[0] > 1 && (
        <>
          <Link href={href(1)} className={base}>
            1
          </Link>
          {pages[0] > 2 && ellipsis}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={cn(base, p === currentPage && "border-primary bg-primary text-primary-foreground")}
        >
          {p}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && ellipsis}
          <Link href={href(totalPages)} className={base}>
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={href(Math.min(totalPages, currentPage + 1))}
        aria-label="Keyingi"
        className={cn(base, currentPage >= totalPages && "pointer-events-none opacity-40")}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
