import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { McpDocsClient } from "@/features/landing/components/mcp-docs-client";

export default async function McpDocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mcpDocs");

  const capabilities = Array.from({ length: 6 }, (_, i) => ({
    name: t(`capabilities.${i}.name`),
    desc: t(`capabilities.${i}.desc`),
  }));

  return (
    <McpDocsClient
      strings={{
        pageTitle: t("pageTitle"),
        pageSubtitle: t("pageSubtitle"),
        whatTitle: t("whatTitle"),
        whatBody: t("whatBody"),
        capabilitiesTitle: t("capabilitiesTitle"),
        capabilities,
        connectTitle: t("connectTitle"),
        claudeCodeTitle: t("claudeCodeTitle"),
        claudeCodeStep1: t("claudeCodeStep1"),
        claudeCodeStep2: t("claudeCodeStep2"),
        claudeCodeStep3: t("claudeCodeStep3"),
        tokenTitle: t("tokenTitle"),
        tokenStep1: t("tokenStep1"),
        tokenStep2: t("tokenStep2"),
        otherClientsTitle: t("otherClientsTitle"),
        otherClientsBody: t("otherClientsBody"),
        quickstartTitle: t("quickstartTitle"),
        quickstartBody: t("quickstartBody"),
        quickstartPrompt: t("quickstartPrompt"),
        quickstartResult: t("quickstartResult"),
        securityTitle: t("securityTitle"),
        securityBody: t("securityBody"),
        copyTooltip: t("copyTooltip"),
      }}
    />
  );
}
