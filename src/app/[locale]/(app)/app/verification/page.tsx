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
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-muted/50">
              <CheckCircle2 className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">Hisobingiz tasdiqlangan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Endi botlardan tushgan daromadni yecha olasiz.
              </p>
            </div>
            <Link
              href="/app/withdraw"
              className="mt-1 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Pul yechishga o&apos;tish
            </Link>
          </CardContent>
        </Card>
      ) : verification?.status === "pending" ? (
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-muted/50">
              <Clock className="h-6 w-6 text-muted-foreground" />
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
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Hujjatlarni yuboring</CardTitle>
            <CardDescription>
              Quyidagi hujjatlarni yuklang. Admin tekshirib tasdiqlagach pul yecha olasiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {verification?.status === "rejected" && verification.rejection_reason && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
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
