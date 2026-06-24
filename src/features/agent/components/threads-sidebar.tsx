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
    <div className="flex h-full flex-col bg-card">
      {/* Top: New thread button */}
      <div className="p-3">
        {/* Mobile close + brand row */}
        {onClose && (
          <div className="mb-2 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-semibold">BotSpace</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* New thread button — mockup: full-width, blue border/bg */}
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-primary/30 bg-primary/10 px-3 py-[11px] text-[13.5px] font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <Plus className="h-[17px] w-[17px]" />
          Yangi suhbat
        </button>
      </div>

      {/* Section label */}
      <div className="px-3 pb-1.5 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-muted-foreground/50">
        Suhbatlar
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {threads.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <MessageSquare className="h-5 w-5 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">Hozircha suhbat yo&apos;q</span>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {threads.map((t) => {
            const isActive = t.id === activeId;
            const time = new Date(t.lastUpdated).toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                onClick={() => onSelect(t.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(t.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium">{t.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(t);
                    }}
                    className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground/50">{time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clear all footer */}
      {onClearAll && threads.length > 0 && (
        <div className="border-t px-3 py-2">
          <button
            type="button"
            onClick={() => setConfirmClearAll(true)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-muted-foreground/60 transition-colors hover:bg-destructive/5 hover:text-destructive"
          >
            <Eraser className="h-3.5 w-3.5" />
            Barcha suhbatlarni tozalash
          </button>
        </div>
      )}

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
