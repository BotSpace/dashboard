"use client";
import { useActionState, useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { submitKycAction } from "@/features/withdraw/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

/**
 * KYC verifikatsiya hujjatlarini yuborish formasi: to'liq ism, pasport rasmi,
 * shaxsiy rasm (selfie) va yashash joyidan ma'lumotnoma.
 */
export function KycForm() {
  const [state, action, pending] = useActionState(submitKycAction, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Hujjatlar yuborildi. Admin tekshiruvini kuting.");
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="grid gap-5 sm:max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="full_name">To&apos;liq ism-sharif (pasportdagidek)</Label>
        <Input id="full_name" name="full_name" placeholder="Masalan: Aliyev Ali Aliyevich" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passport_image">Pasport rasmi</Label>
        <Input id="passport_image" name="passport_image" type="file" accept="image/*" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="selfie_image">Shaxsiy rasm (pasport bilan selfie)</Label>
        <Input id="selfie_image" name="selfie_image" type="file" accept="image/*" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="residence_reference">Yashash joyidan ma&apos;lumotnoma</Label>
        <Input
          id="residence_reference"
          name="residence_reference"
          type="file"
          accept="image/*,application/pdf"
          required
        />
        <p className="text-xs text-muted-foreground">Rasm yoki PDF formatida</p>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Yuborish
        </Button>
      </div>
    </form>
  );
}
