"use client";
import { useState, useTransition } from "react";
import { AlertTriangle, ChevronDown, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { deleteBotAction } from "../actions";

export function DangerZone({
  id,
  locale,
  name,
}: {
  id: string | number;
  locale: string;
  name?: string;
}) {
  const t = useTranslations("bots.danger");
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  // Require typing the exact bot name to enable deletion. When the bot has
  // no name yet, fall back to allowing deletion (nothing to type).
  const matches = name ? confirm.trim() === name.trim() : true;

  const onDelete = () => {
    if (!matches || pending) return;
    start(async () => {
      try {
        await deleteBotAction(id, locale);
      } catch (e) {
        if (
          e &&
          typeof e === "object" &&
          "digest" in e &&
          String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        toast.error(t("error"));
      }
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          {t("title")}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border p-4">
          <p className="text-sm text-muted-foreground">{t("desc")}</p>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              {name ? t("typeToConfirm", { name }) : t("confirmDesc")}
            </label>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("confirmPlaceholder")}
              disabled={pending}
              autoComplete="off"
            />
          </div>

          <Button
            variant="destructive"
            size="sm"
            disabled={!matches || pending}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            {pending ? t("deleting") : t("delete")}
          </Button>
        </div>
      )}
    </div>
  );
}
