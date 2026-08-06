"use client";
import { useRef, useState, useCallback } from "react";
import { ImageIcon, Video, X, UploadCloud, FileVideo } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export type MediaFile = {
  file: File;
  type: "photo" | "video";
  previewUrl: string;
};

interface MediaUploadProps {
  value: MediaFile | null;
  onChange: (media: MediaFile | null) => void;
  disabled?: boolean;
}

const PHOTO_MAX = 10 * 1024 * 1024; // 10 MB
const VIDEO_MAX = 50 * 1024 * 1024; // 50 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUpload({ value, onChange, disabled }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error("Faqat rasm yoki video fayllar qabul qilinadi");
        return;
      }

      if (isImage && file.size > PHOTO_MAX) {
        toast.error(`Rasm hajmi 10 MB dan oshmasin (hozir ${formatBytes(file.size)})`);
        return;
      }
      if (isVideo && file.size > VIDEO_MAX) {
        toast.error(`Video hajmi 50 MB dan oshmasin (hozir ${formatBytes(file.size)})`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      onChange({ file, type: isImage ? "photo" : "video", previewUrl });
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
  };

  if (value) {
    return (
      <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/20">
        {value.type === "photo" ? (
          <>
            <img
              src={value.previewUrl}
              alt="Media preview"
              className="max-h-64 w-full object-cover"
            />
            {/* Bottom info chip */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md border border-white/20 bg-black/70 px-2.5 py-1 text-xs text-white">
              <ImageIcon className="h-3 w-3" />
              <span className="font-medium">{formatBytes(value.file.size)}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <FileVideo className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{value.file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Video · {formatBytes(value.file.size)}
              </p>
            </div>
          </div>
        )}
        {/* Remove button */}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 h-7 w-7 rounded-md opacity-90 transition-opacity hover:opacity-100"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Mediani o&apos;chirish</span>
        </Button>

        {/* Replace button on hover */}
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/0 transition-colors",
            "hover:bg-black/20 focus-visible:outline-none",
            value.type === "photo" ? "cursor-pointer" : "pointer-events-none",
          )}
          aria-label="Media almashtirishb"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Media fayl yuklash"
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        dragging
          ? "border-foreground/30 bg-muted/60 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/30 hover:text-foreground",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors",
          dragging ? "bg-background text-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <UploadCloud className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium">Rasm yoki video yuklang</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bosing yoki bu yerga torting
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/70">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            Rasm · max 10 MB
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            Video · max 50 MB
          </span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={handleChange}
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  );
}
