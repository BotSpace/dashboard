"use client";
import { useState, useTransition } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { ApprovalPayload } from "../types";
import { approveRunAction } from "../actions";

type Props = {
  projectId: string;
  requestId: string;
  payload: ApprovalPayload | null;
};

export function ApprovalDialog({ projectId, requestId, payload }: Props) {
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const open = Boolean(payload);

  const decide = (approved: boolean) => {
    start(async () => {
      const res = await approveRunAction({
        projectId,
        requestId,
        approved,
        reason: reason || undefined,
      });
      if (!res.ok) toast.error(res.message ?? "Approval failed");
      setReason("");
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Approval required
          </DialogTitle>
          <DialogDescription>
            Agent destructive operatsiyani bajarmoqchi. Tasdiqlaysizmi?
          </DialogDescription>
        </DialogHeader>
        {payload && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Tool:</span>{" "}
              <code className="text-xs">{payload.tool_name}</code>
            </div>
            <div className="rounded bg-muted/40 p-2 text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(payload.arguments ?? {}, null, 2)}
              </pre>
            </div>
            {payload.reason && (
              <div className="text-xs text-muted-foreground">{payload.reason}</div>
            )}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Izoh (ixtiyoriy)"
              rows={2}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => decide(false)} disabled={pending}>
            Rad etish
          </Button>
          <Button onClick={() => decide(true)} disabled={pending}>
            Tasdiqlash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
