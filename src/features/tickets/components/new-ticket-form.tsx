"use client";
import { useActionState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
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
      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Yuborish
      </Button>
    </form>
  );
}
