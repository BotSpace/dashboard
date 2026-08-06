"use client";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { createTicketAction } from "@/features/tickets/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

export function NewTicketForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createTicketAction, undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Murojaat yuborildi");
      router.push("/app/tickets");
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="subject">Mavzu</Label>
        <Input id="subject" name="subject" placeholder="Qisqacha mavzu" required maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Xabar</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Muammoingizni batafsil yozing..."
          required
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Fayl (ixtiyoriy)</Label>
        {/* Bitta doimiy input — fayl tanlangach almashtirilmaydi (aks holda yo'qoladi) */}
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors",
            fileName
              ? "border-border bg-muted/50 text-foreground"
              : "border-dashed border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
          )}
        >
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileName ?? "Rasm yoki hujjat biriktirish"}</span>
          <input
            type="file"
            name="attachment"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <p className="text-xs text-muted-foreground">Rasm yoki hujjat (PDF, DOC, XLS) — maks 25 MB</p>
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Yuborish
      </Button>
    </form>
  );
}
