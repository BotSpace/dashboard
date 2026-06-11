"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { upgradePlanAction } from "@/features/billing/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";

interface PlanUpgradeButtonProps {
  planId: number | string;
  /** Tarif nomi (chiroyli ko'rinishi) — dialog matni uchun. */
  planLabel: string;
  /** Oylik narx (USD). 0 bo'lsa bepul tarif. */
  price: number;
  isCurrent: boolean;
  /** t("upgrade") — tugma matni. */
  label: string;
}

/**
 * Tarifga o'tish tugmasi. Bosilganda tasdiqlash oynasi chiqadi (chunki pullik
 * tarifda balansdan mablag' yechiladi), so'ng `upgradePlanAction` chaqiriladi.
 */
export function PlanUpgradeButton({
  planId,
  planLabel,
  price,
  isCurrent,
  label,
}: PlanUpgradeButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" size="sm" disabled>
        Joriy tarif
      </Button>
    );
  }

  const doUpgrade = () => {
    startTransition(async () => {
      const res = await upgradePlanAction(planId);
      if (res.ok) {
        setConfirmOpen(false);
        toast.success("Tarif yangilandi", { description: `Yangi tarif: ${planLabel}` });
        router.refresh();
      } else {
        toast.error(res.message ?? "Tarifni yangilashda xatolik");
      }
    });
  };

  return (
    <>
      <Button className="w-full" size="sm" onClick={() => setConfirmOpen(true)}>
        {label}
      </Button>

      <Dialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!pending) setConfirmOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="capitalize">{planLabel} tarifiga o&apos;tish</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            {price > 0 ? (
              <p>
                Bu tarifga o&apos;tish uchun balansingizdan{" "}
                <strong className="text-foreground">${price}</strong> yechiladi (1 oy).
              </p>
            ) : (
              <p>
                <strong className="text-foreground capitalize">{planLabel}</strong> tarifiga
                qaytasizmi?
              </p>
            )}
            <p>Davom etasizmi?</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                Bekor qilish
              </Button>
            </DialogClose>
            <Button size="sm" disabled={pending} onClick={doUpgrade} className="gap-2">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Yangilanmoqda…" : "Ha, o'tish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
