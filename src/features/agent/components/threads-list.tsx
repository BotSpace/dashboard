"use client";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { ThreadMeta } from "../storage";

type Props = {
  threads: ThreadMeta[];
  activeId: string | null;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: (threadId: string) => void;
};

export function ThreadsList({ threads, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Suhbatlar
        </div>
        <Button onClick={onNew} variant="ghost" size="sm" className="h-7 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Yangi
        </Button>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-1.5">
        {threads.length === 0 && (
          <li className="px-2 py-4 text-center text-xs text-muted-foreground">
            Hozircha suhbat yo'q
          </li>
        )}
        {threads.map((t) => {
          const isActive = t.id === activeId;
          return (
            <li key={t.id}>
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className="flex flex-1 items-center gap-2 truncate text-left"
                >
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive && "text-primary"
                    )}
                  />
                  <span className="truncate" title={t.title}>
                    {t.title}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Suhbatni o'chirish?")) onDelete(t.id);
                  }}
                  className="invisible rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:visible"
                  aria-label="O'chirish"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
