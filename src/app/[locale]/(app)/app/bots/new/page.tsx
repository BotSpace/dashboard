import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilePlus2, LayoutTemplate } from "lucide-react";
import { CreateBotForm } from "@/features/bots/components/create-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";

export default async function NewBotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.create");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/40">
          <CardHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <CardTitle>{t("blank")}</CardTitle>
            <CardDescription>{t("blankDesc")}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-muted">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <CardTitle>{t("fromTemplate")}</CardTitle>
            <CardDescription>{t("fromTemplateDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild size="sm">
              <Link href="/app/templates">→ Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CreateBotForm />
        </CardContent>
      </Card>
    </div>
  );
}
