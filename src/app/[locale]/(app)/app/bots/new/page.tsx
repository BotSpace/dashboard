import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilePlus2, LayoutTemplate, Plus } from "lucide-react";
import { CreateBotForm } from "@/features/bots/components/create-form";
import { CardDescription } from "@/shared/components/ui/card";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";

export default async function NewBotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.create");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("title")}
        icon={<Plus className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-violet-500/30 bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <p className="font-semibold leading-none">{t("blank")}</p>
          <CardDescription className="mt-1.5">{t("blankDesc")}</CardDescription>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          <p className="font-semibold leading-none">{t("fromTemplate")}</p>
          <CardDescription className="mt-1.5">{t("fromTemplateDesc")}</CardDescription>
          <Button variant="outline" asChild size="sm" className="mt-3">
            <Link href="/app/templates">→ Marketplace</Link>
          </Button>
        </div>
      </div>

      <Section title="Bot ma'lumotlari" icon={<Plus className="h-4 w-4" />}>
        <CreateBotForm />
      </Section>
    </div>
  );
}
