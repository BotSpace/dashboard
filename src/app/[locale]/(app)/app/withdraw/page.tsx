import { setRequestLocale } from "next-intl/server";
import { Banknote, CheckCircle2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import { EarningsAPI, KycAPI, WithdrawalAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency } from "@/shared/lib/utils";
import { WithdrawForm } from "@/features/withdraw/components/withdraw-form";
import type { WithdrawalStatus } from "@/shared/types/api";

const STATUS_META: Record<WithdrawalStatus, { label: string; variant: "secondary" | "default" | "destructive" }> = {
  pending: { label: "Kutilmoqda", variant: "secondary" },
  approved: { label: "Tasdiqlangan", variant: "default" },
  rejected: { label: "Rad etilgan", variant: "destructive" },
};

export default async function WithdrawPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [kyc, earnings, withdrawals] = await Promise.all([
    KycAPI.status().catch(() => ({ is_verified: false, verification: null })),
    EarningsAPI.summary().catch(() => null),
    WithdrawalAPI.list().catch(() => []),
  ]);

  // Faqat bot daromadi yechiladi (o'zi to'ldirgan pul emas).
  const withdrawable = Number(earnings?.withdrawable ?? 0);
  const isPending = kyc.verification?.status === "pending";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Pul yechish" subtitle="Bot daromadini kartangizga chiqaring" icon={<Banknote className="h-5 w-5" />} />

      {!kyc.is_verified ? (
        /* Verifikatsiya qilinmagan — alohida sahifaga yo'naltirish */
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-500/10">
              <ShieldAlert className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-semibold">Siz verifikatsiyadan o&apos;tmagansiz</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPending
                  ? "Hujjatlaringiz tekshirilmoqda. Admin tasdiqlagach pul yecha olasiz."
                  : "Pul yechishdan oldin shaxsingizni tasdiqlashingiz kerak."}
              </p>
            </div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/app/verification">
                <ShieldCheck className="h-4 w-4" />
                {isPending ? "Holatni ko'rish" : "Verifikatsiyadan o'tish"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Yechiladigan balans */}
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                <Wallet className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yechish mumkin (bot daromadi)</p>
                <p className="text-2xl font-bold">{formatCurrency(withdrawable, "UZS", locale)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Forma */}
          <Card>
            <CardContent className="py-6">
              {withdrawable < 1000 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Hozircha yechish uchun yetarli bot daromadi yo&apos;q (minimal 1 000 so&apos;m).
                </p>
              ) : (
                <WithdrawForm withdrawable={withdrawable} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pul yechish tarixi */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">So&apos;rovlar tarixi</h2>
        <Card>
          <CardContent className="p-0">
            {withdrawals.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Hozircha so&apos;rovlar yo&apos;q</p>
            ) : (
              <ul className="divide-y">
                {withdrawals.map((w) => {
                  const meta = STATUS_META[w.status] ?? STATUS_META.pending;
                  return (
                    <li key={w.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium">{formatCurrency(Number(w.amount), "UZS", locale)}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {w.card_number} · {w.created_at ?? "—"}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {w.status === "approved" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
