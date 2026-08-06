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
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => select(r.value)}
          className={cn(
            "rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors",
            current === r.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
