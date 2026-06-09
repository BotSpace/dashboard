"use client";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { createTicketAction } from "@/features/tickets/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

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
        {fileName ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{fileName}</span>
            </span>
            <label className="shrink-0 cursor-pointer rounded-md p-1 hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
              <input
                type="file"
                name="attachment"
                className="sr-only"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-blue-500/50 hover:bg-muted/30">
            <Paperclip className="h-4 w-4" />
            Rasm yoki hujjat biriktirish
            <input
              type="file"
              name="attachment"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        )}
        <p className="text-xs text-muted-foreground">Rasm yoki hujjat (PDF, DOC, XLS) — maks 25 MB</p>
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Yuborish
      </Button>
    </form>
  );
}
