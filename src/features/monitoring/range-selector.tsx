"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { MonitoringRange } from "@/shared/types/api";

const RANGES: { value: MonitoringRange; label: string }[] = [
  { value: "1h", label: "1 soat" },
  { value: "6h", label: "6 soat" },
  { value: "24h", label: "24 soat" },
  { value: "7d", label: "7 kun" },
];

export function RangeSelector({ current }: { current: MonitoringRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function select(range: MonitoringRange) {
    const next = new URLSearchParams(params.toString());
    next.set("range", range);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => select(r.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            current === r.value
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
