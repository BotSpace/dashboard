"use client";
import { useRouter, usePathname } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";

type BotOption = { id: string; name: string };

/**
 * Botlarni belgilab transactionlarni filtrlash. Tanlangan botlar `?bots=1,2`
 * query'ga yoziladi va server sahifa `project_in` orqali filtrlaydi.
 * Joriy tanlov server sahifadan `selected` prop orqali keladi (CSR bailout'siz).
 */
export function TransactionsFilter({ bots, selected }: { bots: BotOption[]; selected: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = new Set(selected);

  const push = (next: Set<string>) => {
    const qs = new URLSearchParams();
    if (next.size) qs.set("bots", Array.from(next).join(","));
    const q = qs.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const toggle = (id: string) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    push(next);
  };

  if (bots.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => push(new Set())}
        className={cn(
          "rounded-full border px-3 py-1 text-xs transition-colors",
          current.size === 0
            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
            : "border-border text-muted-foreground hover:bg-muted/50"
        )}
      >
        Hammasi
      </button>
      {bots.map((b) => {
        const active = current.has(b.id);
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => toggle(b.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              active
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            {b.name}
          </button>
        );
      })}
    </div>
  );
}
