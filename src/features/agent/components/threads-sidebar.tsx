"use client";
import { useState } from "react";
import { MessageSquare, Plus, Trash2, X, Sparkles, Eraser } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { ThreadMeta } from "../storage";
import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  threads: ThreadMeta[];
  activeId: string;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: (threadId: string) => void;
  onClearAll?: () => void;
  onClose?: () => void;
};

export function ThreadsSidebar({ threads, activeId, onSelect, onNew, onDelete, onClearAll, onClose }: Props) {
  const [pendingDelete, setPendingDelete] = useState<ThreadMeta | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
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
          <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-muted/30">
            <Sparkles className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold">BotSpace</span>
        </div>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground md:block">
          Suhbatlar
        </span>
        <div className="ml-auto flex items-center gap-1">
          {onClearAll && threads.length > 0 && (
            <Button
              onClick={() => setConfirmClearAll(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/70 hover:text-destructive"
              title="Barcha suhbatlarni tozalash"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onNew}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Yangi suhbat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
                    ? "bg-muted font-medium text-foreground"
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
                      isActive ? "text-foreground" : "text-muted-foreground/60"
                    )}
                  />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(t);
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Suhbatni o'chirish"
        description={pendingDelete ? `"${pendingDelete.title}" suhbati butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.` : undefined}
        confirmLabel="O'chirish"
        destructive
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
        }}
      />
      <ConfirmDialog
        open={confirmClearAll}
        onOpenChange={setConfirmClearAll}
        title="Barcha suhbatlarni tozalash"
        description="Bu loyihadagi BARCHA suhbatlar butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi."
        confirmLabel="Hammasini tozalash"
        destructive
        onConfirm={() => onClearAll?.()}
      />
    </div>
  );
}
