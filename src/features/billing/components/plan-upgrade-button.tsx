"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { upgradePlanAction } from "@/features/billing/actions";
import { analytics } from "@/shared/analytics/umami";
import { formatCurrency } from "@/shared/lib/utils";
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
        analytics.planUpgrade({ plan: planLabel, price: Number(price) });
        setConfirmOpen(false);
        toast.success("Tarif yangilandi", {
          description:
            Number(price) > 0
              ? `${planLabel} — ${formatCurrency(Number(price), "UZS")} balansdan yechildi`
              : `Yangi tarif: ${planLabel}`,
        });
        router.refresh();
      } else {
        // Sabab muhim: "balansda mablag' yetarli emas" — bu tarif olmoqchi
        // bo'lgan, lekin puli yo'q foydalanuvchi (hisob to'ldirishga yo'naltirish
        // kerak bo'lgan joy), oddiy server xatosidan butunlay boshqacha holat.
        analytics.planUpgradeFailed({
          plan: planLabel,
          price: Number(price),
          reason: res.message ?? "unknown",
        });
        toast.error(res.message ?? "Tarifni yangilashda xatolik");
      }
    });
  };

  return (
    <>
      <Button
        className="w-full"
        size="sm"
        onClick={() => {
          analytics.planUpgradeClicked({ plan: planLabel, price: Number(price) });
          setConfirmOpen(true);
        }}
      >
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
                <strong className="text-foreground">{formatCurrency(Number(price), "UZS")}</strong>{" "}
                yechiladi (1 oy).
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
