"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { deleteFileAction } from "../actions";

export function FileDeleteButton({
  id,
  project,
  name,
}: {
  id: string | number;
  project?: string | number;
  name?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!window.confirm(`${name ? `"${name}"` : "Bu fayl"} o'chiriladi. Davom etasizmi?`)) return;
    start(async () => {
      const res = await deleteFileAction({ id, project });
      if (res.ok) {
        toast.success("Fayl o'chirildi");
        router.refresh();
      } else {
        toast.error(res.message ?? "O'chirishda xatolik");
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onDelete}
      disabled={pending}
      aria-label="Faylni o'chirish"
      title="O'chirish"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
