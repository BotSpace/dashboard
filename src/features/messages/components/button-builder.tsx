"use client";
import { Plus, Trash2, Link2, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type InlineButton = {
  title: string;
  variant: "callback" | "url";
  callback_data?: string;
  link?: string;
};

export type ButtonRow = InlineButton[];

// ── Serialiser ────────────────────────────────────────────────────────────────

export function serializeButtons(rows: ButtonRow[]): string {
  const mapped = rows.map((row) =>
    row.map((b) => {
      const out: Record<string, string> = { title: b.title };
      if (b.variant === "url") out.link = b.link ?? "";
      else out.callback_data = b.callback_data ?? "";
      return out;
    }),
  );
  return JSON.stringify(mapped);
}

// ── Inline button editor ──────────────────────────────────────────────────────

function InlineBtnEditor({
  btn,
  onChange,
  onRemove,
  disabled,
}: {
  btn: InlineButton;
  onChange: (b: InlineButton) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
      {/* Row: title + remove */}
      <div className="flex items-center gap-2">
        <Input
          value={btn.title}
          onChange={(e) => onChange({ ...btn, title: e.target.value })}
          placeholder="Tugma matni"
          disabled={disabled}
          className="h-8 flex-1 text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Tugmani o'chirish"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {/* Row: variant toggle + value */}
      <div className="flex items-center gap-2">
        {/* Variant segmented */}
        <div className="flex h-8 shrink-0 overflow-hidden rounded-md border border-input text-xs font-medium">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...btn, variant: "url" })}
            className={cn(
              "flex items-center gap-1.5 px-2.5 transition-colors",
              btn.variant === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Link2 className="h-3 w-3" />
            URL
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...btn, variant: "callback" })}
            className={cn(
              "flex items-center gap-1.5 border-l border-input px-2.5 transition-colors",
              btn.variant === "callback"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Zap className="h-3 w-3" />
            Callback
          </button>
        </div>
        {/* Value input */}
        {btn.variant === "url" ? (
          <Input
            value={btn.link ?? ""}
            onChange={(e) => onChange({ ...btn, link: e.target.value })}
            placeholder="https://example.com"
            disabled={disabled}
            className="h-8 flex-1 text-sm"
          />
        ) : (
          <Input
            value={btn.callback_data ?? ""}
            onChange={(e) => onChange({ ...btn, callback_data: e.target.value })}
            placeholder="callback_data"
            disabled={disabled}
            className="h-8 flex-1 text-sm font-mono"
          />
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ButtonBuilderProps {
  rows: ButtonRow[];
  onRowsChange: (rows: ButtonRow[]) => void;
  disabled?: boolean;
}

function makeInlineBtn(): InlineButton {
  return { title: "", variant: "url", link: "" };
}

export function ButtonBuilder({ rows, onRowsChange, disabled }: ButtonBuilderProps) {
  const addRow = () => {
    onRowsChange([...rows, [makeInlineBtn()]]);
  };

  const addBtnToRow = (rowIdx: number) => {
    const next = rows.map((row, i) => (i === rowIdx ? [...row, makeInlineBtn()] : row));
    onRowsChange(next);
  };

  const updateBtn = (rowIdx: number, btnIdx: number, btn: InlineButton) => {
    const next = rows.map((row, ri) =>
      ri === rowIdx ? row.map((b, bi) => (bi === btnIdx ? btn : b)) : row,
    );
    onRowsChange(next);
  };

  const removeBtn = (rowIdx: number, btnIdx: number) => {
    const next = rows
      .map((row, ri) => (ri === rowIdx ? row.filter((_, bi) => bi !== btnIdx) : row))
      .filter((row) => row.length > 0);
    onRowsChange(next);
  };

  const removeRow = (rowIdx: number) => {
    onRowsChange(rows.filter((_, i) => i !== rowIdx));
  };

  return (
    <div className="space-y-4">
      {/* Rows */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((row, ri) => (
            <div
              key={ri}
              className="overflow-hidden rounded-lg border border-border bg-muted/20"
            >
              {/* Row header */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  {ri + 1}-qator
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeRow(ri)}
                  disabled={disabled}
                  aria-label="Qatorni o'chirish"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Buttons in row */}
              <div className="p-3 space-y-2">
                {row.map((btn, bi) => (
                  <InlineBtnEditor
                    key={bi}
                    btn={btn}
                    onChange={(b) => updateBtn(ri, bi, b)}
                    onRemove={() => removeBtn(ri, bi)}
                    disabled={disabled}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => addBtnToRow(ri)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors",
                    "hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ustun qo&apos;shish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add row */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2 text-sm border-dashed"
        onClick={addRow}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Yangi qator qo&apos;shish
      </Button>
    </div>
  );
}
