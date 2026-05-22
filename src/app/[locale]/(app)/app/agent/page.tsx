import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { ChatPanel } from "@/features/agent/components/chat-panel";
import { ProjectPicker } from "@/features/agent/components/project-picker";
import { ProjectsAPI } from "@/shared/api/services";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("agent");

  // Default to "global" — agent will ask the user to pick a project when needed.
  const projects = await ProjectsAPI.list().catch(() => []);
  const projectId = sp.project ?? "global";

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ProjectPicker projects={projects} current={projectId} />
      </header>

      <div className="min-h-0 flex-1">
        <ChatPanel key={projectId} projectId={projectId} />
      </div>
    </div>
  );
}
