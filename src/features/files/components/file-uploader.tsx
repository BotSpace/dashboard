"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { uploadFileAction } from "../actions";

type Props = {
  projectId?: string | number;
  accept?: string;
  maxSizeMb?: number;
};

const TTL_OPTIONS = [
  { label: "Doimiy", value: "0" },
  { label: "1 kun", value: "86400" },
  { label: "7 kun", value: "604800" },
  { label: "30 kun", value: "2592000" },
  { label: "Boshqa (kun)", value: "custom" },
] as const;

export function FileUploader({ projectId, accept, maxSizeMb = 50 }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [ttlValue, setTtlValue] = useState<string>("0");
  const [customDays, setCustomDays] = useState<string>("");

  const resolvedTtl = (): number => {
    if (ttlValue === "custom") {
      const days = parseInt(customDays, 10);
      return isNaN(days) || days <= 0 ? 0 : days * 86400;
    }
    return parseInt(ttlValue, 10) || 0;
  };

  const upload = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const tooBig = list.find((f) => f.size > maxBytes);
    if (tooBig) {
      toast.error(`"${tooBig.name}" hajmi ${maxSizeMb}MB dan katta`);
      return;
    }
    const ttl = resolvedTtl();
    start(async () => {
      let ok = 0;
      let failed = 0;
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        if (projectId !== undefined) fd.append("project", String(projectId));
        if (ttl > 0) fd.append("ttl", String(ttl));
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
    <div className="space-y-3">
      {/* TTL tanlovi */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Saqlash muddati</Label>
          <Select value={ttlValue} onValueChange={setTtlValue} disabled={pending}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TTL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {ttlValue === "custom" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Kunlar soni</Label>
            <Input
              type="number"
              min={1}
              placeholder="Masalan: 14"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              disabled={pending}
              className="w-32 h-8 text-sm"
            />
          </div>
        )}
      </div>

      {/* Drag & drop zona */}
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
    </div>
  );
}
