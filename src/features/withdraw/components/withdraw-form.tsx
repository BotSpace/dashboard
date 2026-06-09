"use client";
import { useActionState, useEffect, useState } from "react";
import { Banknote, CreditCard, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { createWithdrawalAction } from "@/features/withdraw/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const fmt = new Intl.NumberFormat("uz-UZ");
const MIN = 1000;

/**
 * Pul yechish formasi: summa (ming ajratgichli formatli), karta raqami va egasi.
 * Faqat botlardan tushgan daromad (withdrawable) yechiladi.
 */
export function WithdrawForm({ withdrawable }: { withdrawable: number }) {
  const [state, action, pending] = useActionState(createWithdrawalAction, undefined);
  const [amount, setAmount] = useState<number | "">("");
  const [card, setCard] = useState("");

  useEffect(() => {
    if (state?.ok) toast.success("Pul yechish so'rovi yuborildi");
    else if (state?.message) toast.error(state.message);
  }, [state]);

  const onAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return setAmount("");
    const n = Math.min(parseInt(digits, 10), withdrawable); // max — yechiladigan summa
    setAmount(n);
  };

  // Karta raqamini 4 xonadan guruhlab ko'rsatish (max 16 raqam).
  const onCardChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    setCard(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  const tooLow = amount !== "" && amount < MIN;
  const canSubmit = amount !== "" && amount >= MIN && !pending;

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="amount-display">Summa</Label>
        {/* Haqiqiy qiymat (raqam) — formaga shu yuboriladi */}
        <input type="hidden" name="amount" value={amount === "" ? "" : String(amount)} />
        <div className="relative">
          <Input
            id="amount-display"
            inputMode="numeric"
            autoComplete="off"
            value={amount === "" ? "" : fmt.format(amount)}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="50 000"
            required
            className="pr-14 text-lg font-medium"
            aria-invalid={tooLow}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            so&apos;m
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={tooLow ? "text-destructive" : "text-muted-foreground"}>
            Minimal: {fmt.format(MIN)} so&apos;m
          </span>
          <button
            type="button"
            onClick={() => setAmount(withdrawable >= MIN ? withdrawable : "")}
            className="font-medium text-blue-500 hover:underline"
          >
            Maksimal: {fmt.format(withdrawable)} so&apos;m
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_number">Karta raqami</Label>
        <div className="relative">
          <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="card_number"
            name="card_number"
            inputMode="numeric"
            autoComplete="off"
            value={card}
            onChange={(e) => onCardChange(e.target.value)}
            placeholder="8600 1234 5678 9012"
            required
            className="pl-9 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_owner">Karta egasi</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="card_owner"
            name="card_owner"
            placeholder="ALIYEV ALI"
            required
            className="pl-9 uppercase"
          />
        </div>
      </div>

      <Button type="submit" disabled={!canSubmit} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
        So&apos;rov yuborish
      </Button>
    </form>
  );
}
