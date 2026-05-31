"use client";
import { MessageSquare, Video, Signal, Wifi, Battery } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MediaFile } from "./media-upload";
import type { ButtonRow, ButtonType, InlineButton, ReplyButton } from "./button-builder";

interface MessagePreviewProps {
  caption: string;
  media: MediaFile | null;
  buttonType: ButtonType;
  rows: ButtonRow[];
}

function isEmpty(caption: string, media: MediaFile | null, rows: ButtonRow[]) {
  return !caption.trim() && !media && rows.length === 0;
}

// Telegram-style phone shell
export function MessagePreview({ caption, media, buttonType, rows }: MessagePreviewProps) {
  const empty = isEmpty(caption, media, rows);
  const hasInlineButtons = buttonType === "inline" && rows.length > 0;
  const hasReplyButtons = buttonType === "reply" && rows.length > 0;

  return (
    <div className="mx-auto max-w-[320px] overflow-hidden rounded-[28px] border border-border shadow-2xl shadow-black/10 dark:shadow-black/40">
      {/* Status bar */}
      <div className="flex h-9 items-center justify-between bg-[#2aabee] px-4 dark:bg-[#1a7fc1]">
        <span className="text-[11px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1 text-white">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <Battery className="h-3 w-3" />
        </div>
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-[#2aabee] px-3 py-2.5 dark:bg-[#1a7fc1]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          <span className="text-sm font-bold text-white">B</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-white">Bot nomi</p>
          <p className="text-[11px] leading-tight text-white/70">bot</p>
        </div>
      </div>

      {/* Chat body */}
      <div
        className={cn(
          "min-h-48 px-3 py-3",
          "bg-[#e3edf7] dark:bg-[#0d1117]",
          // Telegram wallpaper subtle pattern
        )}
      >
        {empty ? (
          <div className="flex h-full min-h-36 flex-col items-center justify-center gap-2.5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 dark:bg-white/5">
              <MessageSquare className="h-5 w-5 text-[#2aabee]/60 dark:text-white/30" />
            </div>
            <p className="text-xs text-[#2aabee]/60 dark:text-white/30">Ko&apos;rinish shu yerda chiqadi</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Date divider */}
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-[10px] text-[#2aabee] dark:bg-white/10 dark:text-white/50">
                Bugun
              </span>
            </div>

            {/* Message bubble */}
            <div className="max-w-[85%] space-y-1">
              <div
                className={cn(
                  "overflow-hidden rounded-2xl rounded-tl-[4px] bg-white shadow-sm dark:bg-[#1e2e3e]",
                )}
              >
                {/* Media */}
                {media?.type === "photo" && (
                  <img
                    src={media.previewUrl}
                    alt="Preview"
                    className="block max-h-52 w-full object-cover"
                  />
                )}
                {media?.type === "video" && (
                  <div className="relative flex h-32 items-center justify-center bg-black/80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                      0:00
                    </div>
                  </div>
                )}

                {/* Caption / text area */}
                {(caption.trim() || !media) && (
                  <div className="px-3 py-2">
                    {caption.trim() ? (
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-gray-900 dark:text-white/90">
                        {caption}
                      </p>
                    ) : (
                      <p className="text-[13px] italic text-gray-400 dark:text-white/30">
                        Matn yo&apos;q
                      </p>
                    )}
                  </div>
                )}

                {/* Time stamp */}
                <div
                  className={cn(
                    "flex justify-end px-3 pb-2",
                    caption.trim() || !media ? "-mt-1" : "",
                  )}
                >
                  <span className="text-[10px] text-gray-400 dark:text-white/30">12:00 ✓✓</span>
                </div>

                {/* Inline buttons — inside bubble */}
                {hasInlineButtons && (
                  <div className="border-t border-gray-100 dark:border-white/10 px-1 pb-1.5 pt-1 space-y-1">
                    {rows.map((row, ri) => (
                      <div key={ri} className="flex gap-1">
                        {row.map((btn, bi) => {
                          const b = btn as InlineButton;
                          return (
                            <div
                              key={bi}
                              className="flex-1 rounded-lg bg-[#2aabee]/8 dark:bg-white/8 px-2 py-1.5 text-center text-[11px] font-medium text-[#2aabee] dark:text-[#5bc8f5] truncate"
                            >
                              {b.title || "…"}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reply keyboard — below bubble, outside */}
            {hasReplyButtons && (
              <div className="mt-1 rounded-2xl border border-white/30 bg-white/80 p-1.5 dark:bg-[#1e2e3e]/80 dark:border-white/10 space-y-1 shadow-sm">
                {rows.map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((btn, bi) => {
                      const b = btn as ReplyButton;
                      const icon = b.request_contact ? "📞 " : b.request_location ? "📍 " : "";
                      return (
                        <div
                          key={bi}
                          className="flex-1 rounded-xl bg-white shadow-sm dark:bg-[#2b3d4f] px-2 py-2 text-center text-[11px] font-medium text-gray-800 dark:text-white/90 truncate"
                        >
                          {icon}{b.title || "…"}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-border bg-white px-3 py-2 dark:bg-[#17212b]">
        <div className="flex-1 rounded-full bg-[#f0f2f5] dark:bg-[#242f3d] px-3 py-1.5 text-[11px] text-gray-400 dark:text-white/30">
          Xabar yozing…
        </div>
      </div>
    </div>
  );
}
