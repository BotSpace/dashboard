"use client";

import { useEffect, useState, useTransition } from "react";
import { Archive, Bot, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { KanbanBoard } from "@/shared/types/api";
import { restoreBoardAction } from "../actions";

export function BoardArchiveList({
  initialBoards,
}: {
  initialBoards: KanbanBoard[];
}) {
  const [boards, setBoards] = useState(initialBoards);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const t = useTranslations("kanban");

  useEffect(() => setBoards(initialBoards), [initialBoards]);

  function restore(board: KanbanBoard) {
    setRestoring(board.id);
    startTransition(async () => {
      try {
        await restoreBoardAction(board.id);
        setBoards((current) => current.filter((item) => item.id !== board.id));
        toast.success(t("boardRestored"));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("restoreFailed"),
        );
      } finally {
        setRestoring(null);
      }
    });
  }

  if (boards.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 text-center">
        <Archive className="mb-3 h-8 w-8 text-muted-foreground/60" />
        <h2 className="font-medium">{t("archiveEmpty")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("archiveEmptyHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {boards.map((board) => (
        <article key={board.id} className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 h-3 w-3 rounded-full opacity-60"
              style={{ backgroundColor: board.color }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{board.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {board.description ||
                  t("manage", { type: board.card_type_label })}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {board.card_count} {board.card_type_label.toLowerCase()}
            </Badge>
            {board.project_ids.length > 0 && (
              <Badge variant="outline">
                <Bot className="mr-1 h-3 w-3" />
                {t("botCount", { count: board.project_ids.length })}
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              disabled={pending && restoring === board.id}
              onClick={() => restore(board)}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              {t("restore")}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
