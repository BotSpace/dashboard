"use client";
import { MessageSquare, Plus, Trash2, X, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { ThreadMeta } from "../storage";

type Props = {
  threads: ThreadMeta[];
  activeId: string;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: (threadId: string) => void;
  onClose?: () => void;
};

export function ThreadsSidebar({ threads, activeId, onSelect, onNew, onDelete, onClose }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <span className="text-sm font-semibold">BotSpace</span>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground md:block">
          Suhbatlar
        </span>
        <Button
          onClick={onNew}
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          title="Yangi suhbat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground">Hozircha suhbat yo&apos;q</span>
          </div>
        )}

        <div className="space-y-0.5">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                >
                  <MessageSquare
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground/60"
                    )}
                  />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`"${t.title}" o'chirilsinmi?`)) onDelete(t.id);
                  }}
                  className="rounded-md p-1 text-muted-foreground/60 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="O'chirish"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
