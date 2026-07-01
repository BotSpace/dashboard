import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Tag } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/routing";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";
import { TemplateCreateWizard } from "@/features/templates/components/template-create-wizard";
import { getTemplateRequirementsAction } from "@/features/templates/actions";

export default async function TemplateCreatePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("templates");

  const tpl = await TemplatesAPI.get(slug).catch(() => null);
  if (!tpl) notFound();

  // Only owned templates can create projects
  const isOwned = Boolean(tpl.is_order);
  const isFree = Number(tpl.price ?? 0) === 0;
  if (!isOwned && !isFree) notFound();

  // Fetch requirements server-side
  const reqRes = await getTemplateRequirementsAction(tpl.id);
  const requirements = reqRes.ok
    ? reqRes.data
    : { credentials: [], modules: [], envs: [] };

  const templateSlug = tpl.slug ?? String(tpl.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("wizardPageTitle", { name: tpl.name })}
        subtitle={t("wizardPageSubtitle")}
        icon={<Tag className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/app/templates/${slug}`} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToTemplate")}
            </Link>
          </Button>
        }
      />

      <Section>
        <TemplateCreateWizard
          templateId={tpl.id}
          templateSlug={templateSlug}
          defaultName={tpl.name}
          requirements={requirements}
          labels={{
            stepBot: t("wizardStepBot"),
            stepSettings: t("wizardStepSettings"),
            stepConnections: t("wizardStepConnections"),
            stepConfirm: t("wizardStepConfirm"),
            next: t("wizardNext"),
            back: t("wizardBack"),
            create: t("wizardCreate"),
            botNameLabel: t("projectNameLabel"),
            botNamePlaceholder: t("projectNamePlaceholder"),
            tokenLabel: t("botTokenLabel"),
            tokenPlaceholder: t("botTokenPlaceholder"),
            tokenHelp: t("botTokenHelp"),
            tokenInvalid: t("wizardTokenInvalid"),
            envsTitle: t("wizardEnvsTitle"),
            envPlaceholder: t("envPlaceholder"),
            credsTitle: t("wizardCredsTitle"),
            credentialSelectPlaceholder: t("credentialSelectPlaceholder"),
            credentialCreateNew: t("credentialCreateNew"),
            credentialCreateTitle: t("credentialCreateTitle"),
            credentialCreateDesc: t("credentialCreateDesc"),
            cancel: t("cancel"),
            confirmTitle: t("wizardConfirmTitle"),
            modulesLabel: t("modulesTitle"),
            modulesNote: t("modulesNote"),
            summaryName: t("wizardSummaryName"),
            summaryToken: t("wizardSummaryToken"),
            summaryEnvs: t("wizardSummaryEnvs"),
            summaryCreds: t("wizardSummaryCreds"),
            success: t("createSuccess"),
            error: t("wizardError"),
            managedTabTelegram: t("managedTabTelegram"),
            managedTabManual: t("managedTabManual"),
            managedBotSelectLabel: t("managedBotSelectLabel"),
            managedBotUsed: t("managedBotUsed"),
            managedBotNoList: t("managedBotNoList"),
            managedNewBotTitle: t("managedNewBotTitle"),
            managedUsernameLabel: t("managedUsernameLabel"),
            managedUsernamePlaceholder: t("managedUsernamePlaceholder"),
            managedUsernameHint: t("managedUsernameHint"),
            managedOptionalNameLabel: t("managedOptionalNameLabel"),
            managedOpenTelegramBtn: t("managedOpenTelegramBtn"),
            managedWaiting: t("managedWaiting"),
            managedConnected: t("managedConnected"),
            managedSelectRequired: t("managedSelectRequired"),
          }}
        />
      </Section>
    </div>
  );
}
