import { setRequestLocale } from "next-intl/server";
import { AlertCircle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { KycAPI } from "@/shared/api/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { KycForm } from "@/features/withdraw/components/kyc-form";

export default async function VerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const kyc = await KycAPI.status();
  const verification = kyc.verification;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Verifikatsiya"
        subtitle="Pul yechish uchun shaxsingizni tasdiqlang"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      {kyc.is_verified ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-semibold">Hisobingiz tasdiqlangan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Endi botlardan tushgan daromadni yecha olasiz.
              </p>
            </div>
            <Link
              href="/app/withdraw"
              className="mt-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Pul yechishga o&apos;tish
            </Link>
          </CardContent>
        </Card>
      ) : verification?.status === "pending" ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-500/10">
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-semibold">Tekshirilmoqda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hujjatlaringiz yuborildi. Admin tasdiqlagach pul yecha olasiz.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hujjatlarni yuboring</CardTitle>
            <CardDescription>
              Quyidagi hujjatlarni yuklang. Admin tekshirib tasdiqlagach pul yecha olasiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
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
    </div>
  );
}
