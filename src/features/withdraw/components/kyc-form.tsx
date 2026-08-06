"use client";
import { useActionState, useEffect, useState } from "react";
import { Check, FileText, IdCard, Loader2, ShieldCheck, Upload, UserSquare } from "lucide-react";
import { toast } from "sonner";
import { submitKycAction } from "@/features/withdraw/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

const DOCS = [
  {
    name: "passport_image",
    label: "Pasport",
    hint: "Asosiy sahifa rasmi",
    icon: IdCard,
    accept: "image/*",
  },
  {
    name: "selfie_image",
    label: "Shaxsiy rasm",
    hint: "Pasport bilan selfie",
    icon: UserSquare,
    accept: "image/*",
  },
  {
    name: "residence_reference",
    label: "Ma'lumotnoma",
    hint: "Yashash joyidan (rasm/PDF)",
    icon: FileText,
    accept: "image/*,application/pdf",
  },
] as const;

/**
 * KYC verifikatsiya hujjatlarini yuborish: to'liq ism + 3 ta hujjat.
 */
export function KycForm() {
  const [state, action, pending] = useActionState(submitKycAction, undefined);
  const [files, setFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state?.ok) toast.success("Hujjatlar yuborildi. Admin tekshiruvini kuting.");
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">To&apos;liq ism-sharif</Label>
        <Input id="full_name" name="full_name" placeholder="Aliyev Ali Aliyevich" required />
        <p className="text-xs text-muted-foreground">Pasportdagidek to&apos;liq yozing</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {DOCS.map((d) => {
          const Icon = d.icon;
          const selected = files[d.name];
          return (
            <label
              key={d.name}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center transition-colors",
                selected
                  ? "border-foreground/30 bg-muted/50"
                  : "border-border hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-md border border-border transition-colors",
                  selected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}
              >
                {selected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className="text-sm font-medium">{d.label}</span>
              <span className="line-clamp-1 max-w-full text-xs text-muted-foreground">
                {selected ?? d.hint}
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                <Upload className="h-3 w-3" /> {selected ? "O'zgartirish" : "Yuklash"}
              </span>
              <input
                type="file"
                name={d.name}
                accept={d.accept}
                required
                className="sr-only"
                onChange={(e) =>
                  setFiles((f) => ({ ...f, [d.name]: e.target.files?.[0]?.name ?? "" }))
                }
              />
            </label>
          );
        })}
      </div>

      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Yuborish
      </Button>
    </form>
  );
}
