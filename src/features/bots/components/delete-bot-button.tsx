"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { deleteBotAction } from "../actions";

export function DeleteBotButton({
  id,
  locale,
  name,
}: {
  id: string | number;
  locale: string;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Botni o&apos;chirish
      </Button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Botni o&apos;chirish</DialogTitle>
            <DialogDescription>
              {name ? `"${name}" boti` : "Bu bot"} va uning barcha ma&apos;lumotlari
              butunlay o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  try {
                    await deleteBotAction(id, locale);
                  } catch (e) {
                    // Let Next's redirect (success) propagate; toast real errors.
                    if (
                      e &&
                      typeof e === "object" &&
                      "digest" in e &&
                      String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
                    ) {
                      throw e;
                    }
                    toast.error("Botni o'chirib bo'lmadi");
                  }
                })
              }
            >
              {pending ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
