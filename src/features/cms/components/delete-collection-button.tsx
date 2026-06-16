"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { useRouter } from "@/shared/i18n/routing";

import { deleteCollectionAction } from "@/features/cms/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

// Delete a CMS collection from the dashboard list. System collections never get
// this button (and the backend also rejects deleting them with 403).
export function DeleteCollectionButton({
  projectId,
  name,
  label,
  redirectTo,
  variant = "icon",
}: {
  projectId: string;
  name: string;
  label: string;
  // When set, navigate here after delete (e.g. from the collection's own page
  // back to the list). Otherwise just refresh the current list.
  redirectTo?: string;
  // "icon" = bare trash button (list cards); "button" = labeled destructive
  // button (page header actions).
  variant?: "icon" | "button";
}) {
  const t = useTranslations("cms");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const onConfirm = () =>
    start(async () => {
      const res = await deleteCollectionAction({ projectId, name });
      if (!res.ok) {
        toast.error(res.message || t("deleteCollectionError"));
        return;
      }
      toast.success(t("deleteCollectionSuccess"));
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });

  const openDialog = (e: React.MouseEvent) => {
    // May live inside a card <Link> — don't navigate, just open the dialog.
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "button" ? (
        <Button variant="outline" size="sm" onClick={openDialog} className="gap-2 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          {t("deleteCollection")}
        </Button>
      ) : (
        <button
          type="button"
          aria-label={t("deleteCollection")}
          title={t("deleteCollection")}
          onClick={openDialog}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t("deleteCollection")}</DialogTitle>
          <DialogDescription>{t("deleteCollectionConfirm", { name: label })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {t("deleteCancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
