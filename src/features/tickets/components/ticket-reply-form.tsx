"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { replyTicketAction } from "@/features/tickets/actions";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

export function TicketReplyForm({ id }: { id: string | number }) {
  const router = useRouter();
  const action = replyTicketAction.bind(null, id);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <Textarea name="message" placeholder="Javob yozing..." rows={3} required />
      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex max-w-[60%] cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileName ?? "Fayl biriktirish"}</span>
          <input
            type="file"
            name="attachment"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Yuborish
        </Button>
      </div>
    </form>
  );
}
