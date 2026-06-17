"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Edit2,
  FlaskConical,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { deleteCredentialAction, testCredentialAction, oauthStartAction, listCredentialsAction } from "@/features/credentials/actions";
import { CredentialForm } from "@/features/credentials/components/credential-form";
import type { Credential, CredentialType } from "@/shared/types/api";

interface CredentialDetailActionsProps {
  credential: Credential;
  types: CredentialType[];
  locale: string;
}

export function CredentialDetailActions({
  credential,
  types,
  locale,
}: CredentialDetailActionsProps) {
  const router = useRouter();

  // Test state
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  // Reconnect (OAuth)
  const [reconnecting, setReconnecting] = useState(false);

  const isOAuth = credential.type?.mode === "oauth2";

  const handleTest = async () => {
    setTestState("testing");
    try {
      const res = await testCredentialAction(credential.id);
      setTestState(res.ok ? "ok" : "fail");
      if (res.ok) {
        toast.success("Ulanish muvaffaqiyatli");
      } else {
        toast.error(res.message ?? "Ulanish xato");
      }
    } catch {
      setTestState("fail");
      toast.error("Test xatolik");
    }
  };

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteCredentialAction(credential.id);
      if (res.ok) {
        toast.success("O'chirildi");
        setDeleteOpen(false);
        router.push(`/${locale}/app/credentials`);
      } else {
        toast.error(res.message ?? "O'chirishda xatolik");
      }
    });
  };

  const handleReconnect = async () => {
    const credType = types.find((t) => t.key === credential.type_key);
    if (!credType?.provider) return;
    setReconnecting(true);

    let settled = false;
    const finish = (ok: boolean, errMsg?: string | null) => {
      if (settled) return;
      settled = true;
      setReconnecting(false);
      if (ok) {
        toast.success("Qayta ulandi");
        router.refresh();
      } else if (errMsg) {
        toast.error(errMsg);
      }
    };

    try {
      const res = await oauthStartAction(credType.provider, credType.key);
      if (!res.ok) {
        toast.error(res.message ?? "OAuth boshlashda xatolik");
        setReconnecting(false);
        return;
      }

      const snapshot = new Set<string>();
      try {
        const before = await listCredentialsAction({ type_key: credType.key, page: 1, page_size: 50 });
        before.results.forEach((c) => snapshot.add(`${c.id}:${c.updated_at}`));
      } catch { /* empty snapshot */ }

      const popup = window.open(res.authorize_url, "oauth-reconnect", "width=520,height=640");

      const poll = setInterval(async () => {
        try {
          const now = await listCredentialsAction({ type_key: credType.key, page: 1, page_size: 50 });
          if (now.results.some((c) => !snapshot.has(`${c.id}:${c.updated_at}`))) {
            clearInterval(poll);
            clearInterval(closeWatch);
            clearTimeout(timeout);
            finish(true);
          }
        } catch { /* keep polling */ }
      }, 2500);

      let graceTicks = 0;
      const closeWatch = setInterval(() => {
        if (popup?.closed && ++graceTicks >= 8) {
          clearInterval(poll);
          clearInterval(closeWatch);
          clearTimeout(timeout);
          finish(false, null);
        }
      }, 500);

      const timeout = setTimeout(() => {
        clearInterval(poll);
        clearInterval(closeWatch);
        finish(false, null);
      }, 180000);
    } catch {
      finish(false, "OAuth boshlanmadi");
    }
  };

  return (
    <>
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Test */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testState === "testing"}
          className="gap-1.5"
        >
          {testState === "testing" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : testState === "ok" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : testState === "fail" ? (
            <XCircle className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <FlaskConical className="h-3.5 w-3.5" />
          )}
          Test
        </Button>

        {/* Reconnect (oauth) or Edit (non-oauth) */}
        {isOAuth ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={reconnecting}
            className="gap-1.5"
          >
            {reconnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Qayta ulash
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-1.5"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Tahrirlash
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          O&apos;chirish
        </Button>
      </div>

      {/* Edit dialog (non-oauth) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Credential tahrirlash</DialogTitle>
            <DialogDescription>
              Nomni yoki ma&apos;lumotlarni yangilang
            </DialogDescription>
          </DialogHeader>
          <CredentialForm
            types={types}
            credential={credential}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>O&apos;chirish tasdiqlash</DialogTitle>
            <DialogDescription>
              <strong>{credential.name}</strong> credentialini o&apos;chirasizmi? Bu amalni
              qaytarib bo&apos;lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              O&apos;chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
