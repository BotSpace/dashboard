"use client";
import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { createTopUpAction } from "@/features/billing/actions";
import { analytics } from "@/shared/analytics/umami";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

const fmt = new Intl.NumberFormat("uz-UZ");
const MIN = 1000;
const PRESETS = [50_000, 100_000, 200_000, 500_000];

/**
 * Balansni to'ldirish tugmasi + dialog. Summa kiritilgach Click to'lov
 * havolasiga yo'naltiradi. Server action `createTopUpAction` link qaytaradi.
 */
export function AddFundsDialog({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [state, action, pending] = useActionState(createTopUpAction, undefined);

  useEffect(() => {
    if (state?.ok && state.link) {
      // Tashqi to'lov sahifasiga o'tamiz.
      window.location.href = state.link;
    } else if (state?.message) {
      analytics.topUpFailed({ reason: state.message });
      toast.error(state.message);
    }
  }, [state]);

  const onAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setAmount(digits ? parseInt(digits, 10) : "");
  };

  const tooLow = amount !== "" && amount < MIN;
  const canSubmit = amount !== "" && amount >= MIN && !pending;

  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          analytics.topUpClicked();
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              {label}
            </DialogTitle>
            <DialogDescription>
              Balansni Click orqali to&apos;ldiring. To&apos;lov sahifasiga yo&apos;naltirilasiz.
            </DialogDescription>
          </DialogHeader>

          {/* Event submit paytida ketadi, redirect paytida emas: Umami so'rovni
              keepalive'siz yuboradi, shuning uchun `location.href` dan oldin
              yuborilgani yo'lda uzilib qolardi. Bu yerda server action javobi
              kutilayotgani uchun ulgurib ketadi. */}
          <form
            action={action}
            onSubmit={() => analytics.paymentStarted({ amount: Number(amount) })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="topup-amount">Summa</Label>
              <input type="hidden" name="amount" value={amount === "" ? "" : String(amount)} />
              <div className="relative">
                <Input
                  id="topup-amount"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount === "" ? "" : fmt.format(amount)}
                  onChange={(e) => onAmountChange(e.target.value)}
                  placeholder="100 000"
                  required
                  className="pr-14 text-lg font-medium"
                  aria-invalid={tooLow}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  so&apos;m
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {fmt.format(p)}
                  </button>
                ))}
              </div>
              {tooLow && (
                <p className="text-xs text-destructive">
                  Minimal: {fmt.format(MIN)} so&apos;m
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                To&apos;ldirish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
