"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { uploadFileAction } from "../actions";

type Props = {
  projectId?: string | number;
  accept?: string;
  maxSizeMb?: number;
};

export function FileUploader({ projectId, accept, maxSizeMb = 50 }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  const upload = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const tooBig = list.find((f) => f.size > maxBytes);
    if (tooBig) {
      toast.error(`"${tooBig.name}" hajmi ${maxSizeMb}MB dan katta`);
      return;
    }
    start(async () => {
      let ok = 0;
      let failed = 0;
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        if (projectId !== undefined) fd.append("project", String(projectId));
        const res = await uploadFileAction(fd);
        if (res.ok) ok++;
        else {
          failed++;
          toast.error(`${file.name}: ${res.message}`);
        }
      }
      if (ok > 0) toast.success(`${ok} ta fayl yuklandi${failed ? `, ${failed} ta xato` : ""}`);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (pending) return;
        upload(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 px-4 text-center transition",
        dragOver ? "border-primary bg-primary/5" : "border-border",
        pending && "opacity-60 pointer-events-none"
      )}
    >
      <div className="rounded-full bg-muted p-3">
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <p className="text-sm font-medium">
        {pending ? "Yuklanmoqda…" : "Faylni shu yerga tashlang yoki tanlang"}
      </p>
      <p className="text-xs text-muted-foreground">Maks. {maxSizeMb} MB</p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="mt-1 gap-2"
      >
        <Upload className="h-3.5 w-3.5" />
        Fayl tanlash
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}
