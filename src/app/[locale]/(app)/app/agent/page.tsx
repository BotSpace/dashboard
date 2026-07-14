import { setRequestLocale } from "next-intl/server";
import { ChatPanel } from "@/features/agent/components/chat-panel";
import { ProjectsAPI } from "@/shared/api/services";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ project?: string; prompt?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const projects = await ProjectsAPI.list().catch(() => []);
  const projectId = sp.project ?? "global";
  // ?prompt= pre-fills the composer — used by the onboarding tour's final step
  // to land the new user on the agent with a ready-to-send example.
  const initialPrompt = typeof sp.prompt === "string" ? sp.prompt : undefined;

  return (
    <div className="-mb-[5.5rem] flex h-[calc(100dvh-7rem)] flex-col lg:h-[calc(100dvh-7.5rem)]">
      <div className="min-h-0 flex-1">
        <ChatPanel
          key={projectId}
          projectId={projectId}
          projects={projects}
          initialPrompt={initialPrompt}
        />
      </div>
    </div>
  );
}
