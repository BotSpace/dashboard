"use client";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { sendBroadcastAction } from "@/features/messages/actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function BroadcastComposer({ projectId }: { projectId: string | number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const caption = textareaRef.current?.value ?? "";
    if (!caption.trim()) return;
    startTransition(async () => {
      const result = await sendBroadcastAction({ projectId, caption });
      if (result.ok) {
        toast.success("Yuborish boshlandi");
        if (textareaRef.current) textareaRef.current.value = "";
        router.refresh();
      } else {
        toast.error(result.message ?? "Yuborishda xatolik yuz berdi");
      }
    });
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Hammaga xabar yuborish</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            name="caption"
            placeholder="Xabar matnini kiriting..."
            rows={4}
            disabled={pending}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Hammaga yuborish
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
