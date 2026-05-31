"use client";
import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  ImageIcon,
  LayoutGrid,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";

import { sendBroadcastFormAction } from "@/features/messages/actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
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
import {
  ButtonBuilder,
  serializeButtons,
  type ButtonType,
  type ButtonRow,
} from "./button-builder";
import { MessagePreview } from "./message-preview";

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

// ── Collapsible section ───────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

function Section({ icon: Icon, title, children, defaultOpen = true, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
          "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex flex-1 items-center gap-2 text-sm font-medium">
          {title}
          {badge}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <>
          <Separator />
          <div className="p-4">{children}</div>
        </>
      )}
    </div>
  );
}

// ── Section badge ─────────────────────────────────────────────────────────────

function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {label}
    </span>
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
  const [buttonType, setButtonType] = useState<ButtonType>("inline");
  const [rows, setRows] = useState<ButtonRow[]>([]);
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
  const totalButtonCount = rows.reduce((s, r) => s + r.length, 0);

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
        fd.set("button_type", buttonType);
        fd.set("buttons", serializeButtons(rows, buttonType));
      }

      const result = await sendBroadcastFormAction(projectId, fd);
      setConfirmOpen(false);

      if (result.ok) {
        toast.success("Yuborish boshlandi", {
          description: "Xabar barcha foydalanuvchilarga ketdi",
        });
        setCaption("");
        setMedia(null);
        setRows([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        router.refresh();
      } else {
        toast.error(result.message ?? "Yuborishda xatolik yuz berdi");
      }
    });
  }, [caption, media, rows, buttonType, projectId, router]);

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || pending) return;
    setConfirmOpen(true);
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        pending={pending}
      />

      <form onSubmit={handleSubmitAttempt} noValidate>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          {/* ── Left column: composer ──────────────────────────────────── */}
          <div className="space-y-4">
            {/* Header card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Hammaga xabar yuborish</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Matn, media va tugmalar qo&apos;shib broadcast yuboring
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Caption section */}
                <Section icon={AlignLeft} title="Matn" defaultOpen>
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
                </Section>

                {/* Media section */}
                <Section
                  icon={ImageIcon}
                  title="Media"
                  defaultOpen={false}
                  badge={
                    media ? (
                      <SectionBadge label={media.type === "photo" ? "Rasm" : "Video"} />
                    ) : undefined
                  }
                >
                  <MediaUpload value={media} onChange={setMedia} disabled={pending} />
                </Section>

                {/* Buttons section */}
                <Section
                  icon={LayoutGrid}
                  title="Tugmalar"
                  defaultOpen={false}
                  badge={
                    totalButtonCount > 0 ? (
                      <SectionBadge label={`${totalButtonCount} ta`} />
                    ) : undefined
                  }
                >
                  <ButtonBuilder
                    buttonType={buttonType}
                    onButtonTypeChange={setButtonType}
                    rows={rows}
                    onRowsChange={setRows}
                    disabled={pending}
                  />
                </Section>

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
          </div>

          {/* ── Right column: live preview ─────────────────────────────── */}
          <div className="xl:sticky xl:top-6 xl:self-start">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Jonli ko&apos;rinish</CardTitle>
                <p className="text-xs text-muted-foreground">Telegram pufakchasi namunasi</p>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <MessagePreview
                  caption={caption}
                  media={media}
                  buttonType={buttonType}
                  rows={rows}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  );
}
