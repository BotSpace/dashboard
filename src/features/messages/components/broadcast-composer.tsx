"use client";
import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Users, ImageIcon, LayoutGrid, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { sendBroadcastFormAction } from "@/features/messages/actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

import { MediaUpload, type MediaFile } from "./media-upload";
import { ButtonBuilder, serializeButtons, type ButtonRow } from "./button-builder";

// ── Caption counter ───────────────────────────────────────────────────────────

const CAPTION_LIMIT = 1024;

function CaptionCounter({ count }: { count: number }) {
  const pct = count / CAPTION_LIMIT;
  return (
    <span
      className={cn(
        "text-xs tabular-nums transition-colors",
        pct >= 1
          ? "font-semibold text-destructive"
          : pct >= 0.85
            ? "font-medium text-amber-500"
            : "text-muted-foreground",
      )}
    >
      {count}/{CAPTION_LIMIT}
    </span>
  );
}

// ── Optional block (constructor-style) ──────────────────────────────────────────

function OptionalBlock({
  icon: Icon,
  title,
  onRemove,
  disabled,
  children,
}: {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  onRemove: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-sm font-medium">{title}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`${title} olib tashlash`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// ── Add button (dashed, constructor-style) ──────────────────────────────────────

function AddButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <Plus className="h-3.5 w-3.5" />
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
}

function ConfirmDialog({ open, onConfirm, onCancel, pending }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xabarni yuborish</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Bu xabar botning{" "}
            <strong className="text-foreground">barcha foydalanuvchilariga</strong> yuboriladi.
          </p>
          <p className="text-sm text-muted-foreground">Davom etasizmi?</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm" disabled={pending} onClick={onCancel}>
              Bekor qilish
            </Button>
          </DialogClose>
          <Button size="sm" disabled={pending} onClick={onConfirm} className="gap-2">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Yuborilmoqda…" : "Ha, yuborish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main composer ─────────────────────────────────────────────────────────────

export function BroadcastComposer({ projectId }: { projectId: string | number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<MediaFile | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [rows, setRows] = useState<ButtonRow[]>([]);
  const [buttonsOpen, setButtonsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const canSubmit = caption.trim().length > 0 || media !== null;

  const removeMedia = () => {
    setMedia(null);
    setMediaOpen(false);
  };

  const removeButtons = () => {
    setRows([]);
    setButtonsOpen(false);
  };

  const handleConfirm = useCallback(() => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("caption", caption);

      if (media) {
        fd.set("message_type", media.type);
        fd.set(media.type, media.file);
      } else {
        fd.set("message_type", "text");
      }

      if (rows.length > 0) {
        fd.set("button_type", "inline");
        fd.set("buttons", serializeButtons(rows));
      }

      const result = await sendBroadcastFormAction(projectId, fd);
      setConfirmOpen(false);

      if (result.ok) {
        toast.success("Yuborish boshlandi", {
          description: "Xabar barcha foydalanuvchilarga ketdi",
        });
        setCaption("");
        setMedia(null);
        setMediaOpen(false);
        setRows([]);
        setButtonsOpen(false);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        router.refresh();
      } else {
        toast.error(result.message ?? "Yuborishda xatolik yuz berdi");
      }
    });
  }, [caption, media, rows, projectId, router]);

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || pending) return;
    setConfirmOpen(true);
  };

  const showAddRow = !mediaOpen || !buttonsOpen;

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        pending={pending}
      />

      <form onSubmit={handleSubmitAttempt} noValidate>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Hammaga xabar yuborish</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Xabar matnini yozing, kerak bo&apos;lsa rasm/video va tugma qo&apos;shing
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Message text — always visible */}
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Xabar matnini kiriting…"
                disabled={pending}
                rows={4}
                maxLength={CAPTION_LIMIT}
                className={cn(
                  "w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-relaxed",
                  "ring-offset-background placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "overflow-hidden transition-colors",
                  caption.length / CAPTION_LIMIT >= 0.85 && "border-amber-400/60",
                  caption.length >= CAPTION_LIMIT && "border-destructive/60",
                )}
              />
              <div className="flex items-center justify-between">
                {caption.length / CAPTION_LIMIT >= 0.85 && caption.length < CAPTION_LIMIT && (
                  <span className="text-[11px] text-amber-500">Limit yaqinlashmoqda</span>
                )}
                {caption.length >= CAPTION_LIMIT && (
                  <span className="text-[11px] text-destructive">Limit to&apos;ldi</span>
                )}
                {caption.length / CAPTION_LIMIT < 0.85 && <span />}
                <CaptionCounter count={caption.length} />
              </div>
            </div>

            {/* Media block (optional) */}
            {mediaOpen && (
              <OptionalBlock
                icon={ImageIcon}
                title="Rasm/Video"
                onRemove={removeMedia}
                disabled={pending}
              >
                <MediaUpload value={media} onChange={setMedia} disabled={pending} />
              </OptionalBlock>
            )}

            {/* Buttons block (optional) */}
            {buttonsOpen && (
              <OptionalBlock
                icon={LayoutGrid}
                title="Tugmalar"
                onRemove={removeButtons}
                disabled={pending}
              >
                <ButtonBuilder rows={rows} onRowsChange={setRows} disabled={pending} />
              </OptionalBlock>
            )}

            {/* Add row (constructor-style) */}
            {showAddRow && (
              <div className="flex gap-2">
                {!mediaOpen && (
                  <AddButton
                    icon={ImageIcon}
                    label="Rasm/Video"
                    onClick={() => setMediaOpen(true)}
                    disabled={pending}
                  />
                )}
                {!buttonsOpen && (
                  <AddButton
                    icon={LayoutGrid}
                    label="Tugmalar"
                    onClick={() => setButtonsOpen(true)}
                    disabled={pending}
                  />
                )}
              </div>
            )}

            {/* Footer: audience note + submit */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                Botning barcha foydalanuvchilariga yuboriladi
              </span>
              <Button
                type="submit"
                disabled={pending || !canSubmit}
                size="sm"
                className="shrink-0 gap-2"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {pending ? "Yuborilmoqda…" : "Yuborish"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
