"use client";
import { Plus, Trash2, Link2, Zap, Phone, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ButtonType = "inline" | "reply";

export type InlineButton = {
  title: string;
  variant: "callback" | "url";
  callback_data?: string;
  link?: string;
};

export type ReplyButton = {
  title: string;
  request_contact?: boolean;
  request_location?: boolean;
};

export type TgButton = InlineButton | ReplyButton;

export type ButtonRow = TgButton[];

// ── Serialiser ────────────────────────────────────────────────────────────────

export function serializeButtons(rows: ButtonRow[], buttonType: ButtonType): string {
  const mapped = rows.map((row) =>
    row.map((btn) => {
      if (buttonType === "inline") {
        const b = btn as InlineButton;
        const out: Record<string, string> = { title: b.title };
        if (b.variant === "url") out.link = b.link ?? "";
        else out.callback_data = b.callback_data ?? "";
        return out;
      } else {
        const b = btn as ReplyButton;
        const out: Record<string, unknown> = { title: b.title };
        if (b.request_contact) out.request_contact = true;
        if (b.request_location) out.request_location = true;
        return out;
      }
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
      {/* Row: type toggle + value */}
      <div className="flex items-center gap-2">
        {/* Variant segmented */}
        <div className="flex h-8 shrink-0 overflow-hidden rounded-md border border-input text-xs font-medium">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...btn, variant: "callback" })}
            className={cn(
              "flex items-center gap-1.5 px-2.5 transition-colors",
              btn.variant === "callback"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Zap className="h-3 w-3" />
            Callback
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...btn, variant: "url" })}
            className={cn(
              "flex items-center gap-1.5 border-l border-input px-2.5 transition-colors",
              btn.variant === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Link2 className="h-3 w-3" />
            URL
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

// ── Reply button editor ───────────────────────────────────────────────────────

function ReplyBtnEditor({
  btn,
  onChange,
  onRemove,
  disabled,
}: {
  btn: ReplyButton;
  onChange: (b: ReplyButton) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
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
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors select-none",
            btn.request_contact
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-border hover:bg-muted/50",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={!!btn.request_contact}
            onChange={(e) =>
              onChange({ ...btn, request_contact: e.target.checked, request_location: false })
            }
            disabled={disabled}
            className="sr-only"
          />
          <Phone className="h-3 w-3" />
          Kontakt so&apos;rash
        </label>
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors select-none",
            btn.request_location
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-border hover:bg-muted/50",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={!!btn.request_location}
            onChange={(e) =>
              onChange({ ...btn, request_location: e.target.checked, request_contact: false })
            }
            disabled={disabled}
            className="sr-only"
          />
          <MapPin className="h-3 w-3" />
          Lokatsiya so&apos;rash
        </label>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ButtonBuilderProps {
  buttonType: ButtonType;
  onButtonTypeChange: (t: ButtonType) => void;
  rows: ButtonRow[];
  onRowsChange: (rows: ButtonRow[]) => void;
  disabled?: boolean;
}

function makeInlineBtn(): InlineButton {
  return { title: "", variant: "callback", callback_data: "" };
}
function makeReplyBtn(): ReplyButton {
  return { title: "" };
}

export function ButtonBuilder({
  buttonType,
  onButtonTypeChange,
  rows,
  onRowsChange,
  disabled,
}: ButtonBuilderProps) {
  const addRow = () => {
    const newBtn = buttonType === "inline" ? makeInlineBtn() : makeReplyBtn();
    onRowsChange([...rows, [newBtn]]);
  };

  const addBtnToRow = (rowIdx: number) => {
    const newBtn = buttonType === "inline" ? makeInlineBtn() : makeReplyBtn();
    const next = rows.map((row, i) => (i === rowIdx ? [...row, newBtn] : row));
    onRowsChange(next);
  };

  const updateBtn = (rowIdx: number, btnIdx: number, btn: TgButton) => {
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

  const handleTypeSwitch = (t: ButtonType) => {
    onButtonTypeChange(t);
    // reset rows when switching type — types are incompatible
    const converted = rows.map((row) =>
      row.map(() => (t === "inline" ? makeInlineBtn() : makeReplyBtn())),
    );
    onRowsChange(converted);
  };

  return (
    <div className="space-y-4">
      {/* Segmented control */}
      <div className="flex h-9 w-full overflow-hidden rounded-lg border border-input text-sm font-medium">
        {(["inline", "reply"] as ButtonType[]).map((t, i) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => handleTypeSwitch(t)}
            className={cn(
              "flex-1 transition-colors",
              i > 0 && "border-l border-input",
              buttonType === t
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {t === "inline" ? "Inline tugmalar" : "Reply klaviatura"}
          </button>
        ))}
      </div>

      {/* Type hint */}
      <p className="text-xs text-muted-foreground">
        {buttonType === "inline"
          ? "Xabar ichida ko'rinadigan tugmalar. URL yoki callback_data qo'shing."
          : "Foydalanuvchi klaviaturasida ko'rinadigan tugmalar. Kontakt yoki lokatsiya so'rash mumkin."}
      </p>

      {/* Rows */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((row, ri) => (
            <div
              key={ri}
              className="rounded-xl border border-border bg-muted/20 overflow-hidden"
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
                {row.map((btn, bi) =>
                  buttonType === "inline" ? (
                    <InlineBtnEditor
                      key={bi}
                      btn={btn as InlineButton}
                      onChange={(b) => updateBtn(ri, bi, b)}
                      onRemove={() => removeBtn(ri, bi)}
                      disabled={disabled}
                    />
                  ) : (
                    <ReplyBtnEditor
                      key={bi}
                      btn={btn as ReplyButton}
                      onChange={(b) => updateBtn(ri, bi, b)}
                      onRemove={() => removeBtn(ri, bi)}
                      disabled={disabled}
                    />
                  ),
                )}

                <button
                  type="button"
                  onClick={() => addBtnToRow(ri)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors",
                    "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
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
