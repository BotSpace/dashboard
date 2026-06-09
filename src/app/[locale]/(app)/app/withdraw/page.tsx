import { setRequestLocale } from "next-intl/server";
import { AlertCircle, Banknote, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { BillingAPI, KycAPI, ProjectsAPI, WithdrawalAPI } from "@/shared/api/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/common/page-header";
import { formatCurrency } from "@/shared/lib/utils";
import { KycForm } from "@/features/withdraw/components/kyc-form";
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

  const [kyc, balanceRes, withdrawals, projects] = await Promise.all([
    KycAPI.status().catch(() => ({ is_verified: false, verification: null })),
    BillingAPI.balance().catch(() => ({ balance: 0 })),
    WithdrawalAPI.list().catch(() => []),
    ProjectsAPI.list().catch(() => []),
  ]);

  const balance = balanceRes.balance ?? 0;
  const botOptions = projects.map((p) => ({ id: String(p.id), name: p.name }));
  const verification = kyc.verification;

  return (
    <div className="space-y-8">
      <PageHeader title="Pul yechish" icon={<Banknote className="h-5 w-5" />} />

      {/* Holatga qarab: verifikatsiya yoki pul yechish formasi */}
      {kyc.is_verified ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Pul yechish so&apos;rovi
            </CardTitle>
            <CardDescription>
              Hisobingiz tasdiqlangan. Pul umumiy balansdan ayriladi va admin tasdiqlagach kartangizga
              o&apos;tkaziladi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WithdrawForm bots={botOptions} balance={balance} />
          </CardContent>
        </Card>
      ) : verification?.status === "pending" ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 py-6">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium">Verifikatsiya tekshirilmoqda</p>
              <p className="text-sm text-muted-foreground">
                Hujjatlaringiz yuborildi. Admin tasdiqlagach pul yecha olasiz.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-blue-500" /> Verifikatsiyadan o&apos;ting
            </CardTitle>
            <CardDescription>
              Pul yechishdan oldin shaxsingizni tasdiqlang: pasport, shaxsiy rasm va yashash joyidan
              ma&apos;lumotnoma yuboring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verification?.status === "rejected" && verification.rejection_reason && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Oldingi so&apos;rov rad etildi</p>
                  <p>{verification.rejection_reason}</p>
                </div>
              </div>
            )}
            <KycForm />
          </CardContent>
        </Card>
      )}

      {/* Pul yechish tarixi */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">So&apos;rovlar tarixi</h2>
        <Card>
          <CardContent className="p-0">
            {withdrawals.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Hozircha so&apos;rovlar yo&apos;q</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Sana</th>
                    <th className="px-4 py-3 text-left">Bot</th>
                    <th className="px-4 py-3 text-right">Summa</th>
                    <th className="px-4 py-3 text-left">Karta</th>
                    <th className="px-4 py-3 text-left">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => {
                    const meta = STATUS_META[w.status] ?? STATUS_META.pending;
                    return (
                      <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{w.created_at ?? "—"}</td>
                        <td className="px-4 py-3">{w.project_name ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(Number(w.amount), "UZS", locale)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.card_number}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            {w.status === "approved" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
