import { setRequestLocale } from "next-intl/server";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { KycAPI } from "@/shared/api/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { KycForm } from "@/features/withdraw/components/kyc-form";

export default async function VerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const kyc = await KycAPI.status().catch(() => ({ is_verified: false, verification: null }));
  const verification = kyc.verification;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Verifikatsiya"
        icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/app/withdraw">
              <ArrowLeft className="h-4 w-4" /> Pul yechishga qaytish
            </Link>
          </Button>
        }
      />

      {kyc.is_verified ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-start gap-3 py-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="font-medium">Hisobingiz tasdiqlangan</p>
              <p className="text-sm text-muted-foreground">
                Endi pul yecha olasiz.{" "}
                <Link href="/app/withdraw" className="text-blue-500 hover:underline">
                  Pul yechish sahifasiga o&apos;tish
                </Link>
              </p>
            </div>
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
              <ShieldCheck className="h-5 w-5 text-blue-500" /> Shaxsingizni tasdiqlang
            </CardTitle>
            <CardDescription>
              Pul yechishdan oldin pasport, shaxsiy rasm (selfie) va yashash joyidan ma&apos;lumotnoma
              yuboring. Admin tasdiqlagach pul yecha olasiz.
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
    </div>
  );
}
