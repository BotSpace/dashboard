"use client";
import { useActionState, useEffect } from "react";
import { Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createWithdrawalAction } from "@/features/withdraw/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type BotOption = { id: string; name: string };

/**
 * Pul yechish formasi: bot tanlash (ixtiyoriy), summa, karta raqami va egasi.
 * Pul umumiy balansdan ayriladi.
 */
export function WithdrawForm({ bots, balance }: { bots: BotOption[]; balance: number }) {
  const [state, action, pending] = useActionState(createWithdrawalAction, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Pul yechish so'rovi yuborildi");
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="grid gap-5 sm:max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="project">Bot (ixtiyoriy)</Label>
        <select
          id="project"
          name="project"
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Umumiy (bot tanlanmagan)</option>
          {bots.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Qaysi bot uchun ekanini belgilang — summa umumiy balansdan ayriladi.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Summa (so&apos;m)</Label>
        <Input id="amount" name="amount" type="number" min={1000} step={1000} placeholder="50000" required />
        <p className="text-xs text-muted-foreground">
          Mavjud balans: {new Intl.NumberFormat("uz-UZ").format(balance)} so&apos;m
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_number">Karta raqami</Label>
        <Input id="card_number" name="card_number" inputMode="numeric" placeholder="8600 1234 5678 9012" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card_owner">Karta egasi</Label>
        <Input id="card_owner" name="card_owner" placeholder="ALIYEV ALI" required />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
          So&apos;rov yuborish
        </Button>
      </div>
    </form>
  );
}
