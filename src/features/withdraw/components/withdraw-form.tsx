"use client";
import { useActionState, useEffect } from "react";
import { Banknote, CreditCard, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { createWithdrawalAction } from "@/features/withdraw/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

/**
 * Pul yechish formasi: summa, karta raqami va egasi.
 * Faqat botlardan tushgan daromad (withdrawable) yechiladi.
 */
export function WithdrawForm({ withdrawable }: { withdrawable: number }) {
  const [state, action, pending] = useActionState(createWithdrawalAction, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Pul yechish so'rovi yuborildi");
    else if (state?.message) toast.error(state.message);
  }, [state]);

  const fmt = new Intl.NumberFormat("uz-UZ");

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="amount">Summa</Label>
        <div className="relative">
          <Input
            id="amount"
            name="amount"
            type="number"
            min={1000}
            step={1000}
            placeholder="50000"
            required
            className="pr-14"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            so&apos;m
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            const form = (e.target as HTMLElement).closest("form");
            const input = form?.querySelector<HTMLInputElement>("#amount");
            if (input) input.value = String(withdrawable);
          }}
          className="text-xs text-blue-500 hover:underline"
        >
          Maksimal: {fmt.format(withdrawable)} so&apos;m
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_number">Karta raqami</Label>
        <div className="relative">
          <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="card_number"
            name="card_number"
            inputMode="numeric"
            placeholder="8600 1234 5678 9012"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_owner">Karta egasi</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="card_owner" name="card_owner" placeholder="ALIYEV ALI" required className="pl-9" />
        </div>
      </div>

      <Button type="submit" disabled={pending || withdrawable < 1000} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
        So&apos;rov yuborish
      </Button>
    </form>
  );
}
