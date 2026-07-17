import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilePlus2, LayoutTemplate, Plus } from "lucide-react";
import { CreateBotWizard } from "@/features/bots/components/create-bot-wizard";
import { CardDescription } from "@/shared/components/ui/card";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";

export default async function NewBotPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.create");
  const w = await getTranslations("bots.wizard");
  // Qaysi tugmadan kelingani — analitika uchun. Tugmaning o'zida track qilib
  // bo'lmaydi: Link darhol boshqa sahifaga o'tkazadi va event yo'lda uziladi.
  const { src } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("title")}
        icon={<Plus className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-500/30 bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
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

      <Section>
        <CreateBotWizard
          source={src}
          labels={{
            stepBot: w("stepBot"),
            stepConfirm: w("stepConfirm"),
            stepLaunch: w("stepLaunch"),
            next: w("next"),
            back: w("back"),
            create: w("create"),
            nameLabel: w("nameLabel"),
            namePlaceholder: w("namePlaceholder"),
            descriptionLabel: w("descriptionLabel"),
            descriptionPlaceholder: w("descriptionPlaceholder"),
            tokenLabel: w("tokenLabel"),
            tokenPlaceholder: w("tokenPlaceholder"),
            tokenHelp: w("tokenHelp"),
            tokenInvalid: w("tokenInvalid"),
            confirmTitle: w("confirmTitle"),
            summaryName: w("summaryName"),
            summaryDescription: w("summaryDescription"),
            summaryConnection: w("summaryConnection"),
            success: w("success"),
            error: w("error"),
            managedTabTelegram: w("managedTabTelegram"),
            managedTabManual: w("managedTabManual"),
            managedBotSelectLabel: w("managedBotSelectLabel"),
            managedBotUsed: w("managedBotUsed"),
            managedBotNoList: w("managedBotNoList"),
            managedNewBotTitle: w("managedNewBotTitle"),
            managedUsernameLabel: w("managedUsernameLabel"),
            managedUsernamePlaceholder: w("managedUsernamePlaceholder"),
            managedUsernameHint: w("managedUsernameHint"),
            managedOptionalNameLabel: w("managedOptionalNameLabel"),
            managedOpenTelegramBtn: w("managedOpenTelegramBtn"),
            managedCopyLink: w("managedCopyLink"),
            managedCopyLinkDone: w("managedCopyLinkDone"),
            managedCopyLinkFail: w("managedCopyLinkFail"),
            managedWaiting: w("managedWaiting"),
            managedConnected: w("managedConnected"),
            debugTabLabel: w("debugTabLabel"),
            debugInfoText: w("debugInfoText"),
            debugConfirmBadge: w("debugConfirmBadge"),
            debugConfirmNote: w("debugConfirmNote"),
            launchStartingTitle: w("launchStartingTitle"),
            launchStartingText: w("launchStartingText"),
            launchRunningTitle: w("launchRunningTitle"),
            launchOpenBotBtn: w("launchOpenBotBtn"),
            launchOpenProjectBtn: w("launchOpenProjectBtn"),
            launchDebugBadge: w("launchDebugBadge"),
            launchDebugHint: w("launchDebugHint"),
            launchFailedTitle: w("launchFailedTitle"),
            launchFailedText: w("launchFailedText"),
            launchTimeoutTitle: w("launchTimeoutTitle"),
            launchTimeoutText: w("launchTimeoutText"),
            launchNoConnectTitle: w("launchNoConnectTitle"),
            launchNoConnectText: w("launchNoConnectText"),
          }}
        />
      </Section>
    </div>
  );
}
