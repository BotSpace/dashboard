import { setRequestLocale } from "next-intl/server";
import { Banknote, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { BillingAPI, KycAPI, ProjectsAPI, WithdrawalAPI } from "@/shared/api/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
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

  const [kyc, balanceRes, withdrawals, projects] = await Promise.all([
    KycAPI.status().catch(() => ({ is_verified: false, verification: null })),
    BillingAPI.balance().catch(() => ({ balance: 0 })),
    WithdrawalAPI.list().catch(() => []),
    ProjectsAPI.list().catch(() => []),
  ]);

  const balance = balanceRes.balance ?? 0;
  const botOptions = projects.map((p) => ({ id: String(p.id), name: p.name }));
  const verification = kyc.verification;
  const isPending = verification?.status === "pending";

  return (
    <div className="space-y-8">
      <PageHeader title="Pul yechish" icon={<Banknote className="h-5 w-5" />} />

      {/* Verifikatsiya qilinmagan bo'lsa — alohida sahifaga yo'naltirish */}
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
      ) : (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> Siz verifikatsiyadan o&apos;tmagansiz
            </CardTitle>
            <CardDescription>
              {isPending
                ? "Hujjatlaringiz tekshirilmoqda. Admin tasdiqlagach pul yecha olasiz."
                : "Pul yechish uchun avval shaxsingizni tasdiqlang — pasport, shaxsiy rasm va yashash joyidan ma'lumotnoma yuboring."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/app/verification">
                <ShieldCheck className="h-4 w-4" />
                {isPending ? "Verifikatsiya holatini ko'rish" : "Verifikatsiya sahifasiga o'tish"}
              </Link>
            </Button>
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
