"use client";
import { useState, useTransition } from "react";
import { HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { ClarifyPayload } from "../types";
import { clarifyRunAction } from "../actions";

type Props = {
  projectId: string;
  requestId: string;
  payload: ClarifyPayload | null;
};

export function ClarifyDialog({ projectId, requestId, payload }: Props) {
  const [answer, setAnswer] = useState("");
  const [pending, start] = useTransition();
  const open = Boolean(payload);

  const submit = () => {
    if (!answer.trim()) return;
    start(async () => {
      const res = await clarifyRunAction({ projectId, requestId, answer });
      if (!res.ok) toast.error(res.message ?? "Yuborib bo'lmadi");
      setAnswer("");
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            Agent savol bermoqda
          </DialogTitle>
          <DialogDescription className="pt-1">
            {payload?.question ?? "Agent qo'shimcha ma'lumot kutmoqda"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-end gap-2 rounded-xl border bg-muted/30 px-3 py-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Javobingiz…"
            rows={2}
            className="min-h-[40px] flex-1 resize-none bg-transparent text-sm focus:outline-none"
          />
          <Button
            onClick={submit}
            disabled={pending || !answer.trim()}
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
