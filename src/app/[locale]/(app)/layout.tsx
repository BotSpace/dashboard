import { redirect } from "next/navigation";
import { readSession } from "@/shared/auth/session";
import { AgentFloatingButton } from "@/features/app-shell/components/agent-floating-button";
import { PageTransition } from "@/features/app-shell/components/page-transition";
import { Sidebar } from "@/features/app-shell/components/sidebar";
import { TopBar } from "@/features/app-shell/components/top-bar";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await readSession();
  if (!session) redirect(`/${locale}/login`);

  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-x-clip px-4 py-6 lg:px-8 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AgentFloatingButton />
    </div>
  );
}
