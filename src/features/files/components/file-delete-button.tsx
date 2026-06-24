"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/features/agent/components/confirm-dialog";
import { deleteFileAction } from "../actions";

export function FileDeleteButton({
  uuid,
  project,
  name,
}: {
  // Backend looks files up by uuid (FileView.lookup_field = "uuid"), not pk.
  uuid?: string;
  project?: string | number;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onConfirm = () => {
    if (!uuid) {
      toast.error("Fayl identifikatori yo'q");
      return;
    }
    start(async () => {
      const res = await deleteFileAction({ id: uuid, project });
      if (res.ok) {
        toast.success("Fayl o'chirildi");
        router.refresh();
      } else {
        toast.error(res.message ?? "O'chirishda xatolik");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={pending}
        aria-label="Faylni o'chirish"
        title="O'chirish"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Faylni o'chirish"
        description={`${name ? `"${name}" ` : "Bu fayl "}o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        destructive
        onConfirm={onConfirm}
      />
    </>
  );
}
