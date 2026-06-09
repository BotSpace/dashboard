"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

/** Bir bosishda nusxalovchi tugma (clipboard + toast). */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} nusxalandi` : "Nusxalandi");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Nusxalash"
      title="Nusxalash"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
