import { Skeleton } from "@/shared/components/ui/skeleton";

/** Sahifa yuklanayotganda ko'rsatiladigan umumiy skeleton (loading.tsx uchun). */
export function PageSkeleton({
  variant = "list",
  cards = 3,
  rows = 6,
}: {
  variant?: "list" | "cards" | "table";
  cards?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {(variant === "list" || variant === "table") && (
        <div className="rounded-lg border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b p-4 last:border-0">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
