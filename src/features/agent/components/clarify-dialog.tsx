"use client";
import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";
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
      if (!res.ok) toast.error(res.message ?? "Clarification failed");
      setAnswer("");
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-5 w-5 text-primary" />
            Agent savol bermoqda
          </DialogTitle>
          <DialogDescription>
            {payload?.question ?? "Agent qo'shimcha ma'lumot kutmoqda"}
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Javobingiz…"
          rows={3}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={submit} disabled={pending || !answer.trim()}>
            Yuborish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
