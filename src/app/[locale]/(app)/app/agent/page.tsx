import { setRequestLocale } from "next-intl/server";
import { ChatPanel } from "@/features/agent/components/chat-panel";
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

  const projects = await ProjectsAPI.list().catch(() => []);
  const projectId = sp.project ?? "global";

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col lg:h-[calc(100dvh-9rem)]">
      <div className="min-h-0 flex-1">
        <ChatPanel key={projectId} projectId={projectId} projects={projects} />
      </div>
    </div>
  );
}
