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
  compact,
}: {
  id: string | number;
  locale: string;
  name?: string;
  /** compact=true: no outer card wrapper, used inside a pre-styled danger card */
  compact?: boolean;
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

  if (compact) {
    return (
      <div>
        <p className="mb-[14px] text-[12.5px] leading-[1.5] text-muted-foreground">
          {t("desc")}
        </p>
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-[7px] rounded-[9px] border border-red-500/30 bg-red-500/10 px-[14px] py-[9px] text-[13px] font-semibold text-red-400 transition-colors hover:bg-red-500/[0.18]"
          >
            <Trash2 className="h-[15px] w-[15px]" />
            {t("delete")}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                {name ? t("typeToConfirm", { name }) : t("confirmDesc")}
              </label>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("confirmPlaceholder")}
                disabled={pending}
                autoComplete="off"
                className="bg-white/[0.03] border-white/10 focus:border-red-500/40 text-[13.5px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={!matches || pending}
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                {pending ? t("deleting") : t("delete")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setExpanded(false); setConfirm(""); }}
              >
                {t("cancel") ?? "Bekor"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-card transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 p-5 text-left"
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
        <div className="space-y-4 border-t border-destructive/20 p-5">
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
