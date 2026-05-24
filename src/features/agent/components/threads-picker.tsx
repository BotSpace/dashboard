"use client";
import { ChevronDown, MessageSquare, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ThreadMeta } from "../storage";

type Props = {
  threads: ThreadMeta[];
  activeId: string;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: (threadId: string) => void;
};

export function ThreadsPicker({ threads, activeId, onSelect, onNew, onDelete }: Props) {
  const active = threads.find((t) => t.id === activeId);
  const label = active?.title ?? "Yangi suhbat";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[80px] truncate sm:max-w-[180px]">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Suhbatlar</span>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onNew();
            }}
            variant="ghost"
            size="sm"
            className="h-6 gap-1 text-[11px]"
          >
            <Plus className="h-3 w-3" />
            Yangi
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {threads.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Hozircha suhbat yo'q
          </DropdownMenuItem>
        )}
        {threads.map((t) => {
          const isActive = t.id === activeId;
          return (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-foreground hover:bg-muted/60"
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
                    isActive ? "text-primary" : "text-muted-foreground"
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
                  if (confirm(`"${t.title}" suhbati o'chirilsinmi?`)) onDelete(t.id);
                }}
                className="invisible rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:visible"
                aria-label="O'chirish"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
