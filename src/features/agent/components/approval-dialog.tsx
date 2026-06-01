"use client";
import { useState, useTransition } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import type { ApprovalPayload } from "../types";
import { approveRunAction } from "../actions";

type Props = {
  projectId: string;
  requestId: string;
  payload: ApprovalPayload | null;
};

/**
 * Inline chat-card for approval prompts. The agent pauses and asks the user
 * to Approve or Reject a destructive action (e.g. flow.clear).
 *
 * Submits: POST /runs/{id}/approve  body: { approved: true | false }
 */
export function ApprovalDialog({ projectId, requestId, payload }: Props) {
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  if (!payload) return null;

  const decide = (approved: boolean) => {
    start(async () => {
      const res = await approveRunAction({
        projectId,
        requestId,
        approved,
        reason: reason.trim() || undefined,
      });
      if (!res.ok) toast.error(res.message ?? "Approval failed");
      setReason("");
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="approval-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="flex gap-3"
      >
        {/* Icon avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </div>

        {/* Card body */}
        <div className="min-w-0 flex-1 rounded-2xl border border-amber-500/20 bg-card px-4 py-3 shadow-sm">
          <p className="mb-1 text-sm font-medium">Tasdiqlash kerak</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Agent quyidagi amalni bajarmoqchi. Ruxsat berasizmi?
          </p>

          {/* Tool info */}
          <div className="mb-3 space-y-1.5 rounded-xl bg-muted/40 px-3 py-2.5 text-xs">
            {payload.tool_name && (
              <div>
                <span className="text-muted-foreground">Tool: </span>
                <code className="font-mono text-foreground">{payload.tool_name}</code>
              </div>
            )}
            {payload.arguments && Object.keys(payload.arguments).length > 0 && (
              <pre className="overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(payload.arguments, null, 2)}
              </pre>
            )}
            {payload.reason && (
              <p className="text-muted-foreground">{payload.reason}</p>
            )}
          </div>

          {/* Optional reason input */}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Izoh (ixtiyoriy)…"
            rows={2}
            disabled={pending}
            className="mb-3 w-full resize-none rounded-xl border bg-muted/20 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => decide(false)}
              disabled={pending}
              className="flex-1 rounded-xl border-destructive/30 text-destructive hover:border-destructive/60 hover:bg-destructive/5 hover:text-destructive"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Rad etish
            </Button>
            <Button
              size="sm"
              onClick={() => decide(true)}
              disabled={pending}
              className="flex-1 rounded-xl"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Tasdiqlash
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
