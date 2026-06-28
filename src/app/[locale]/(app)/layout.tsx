import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/shared/auth/session";
import { UmamiIdentify } from "@/shared/analytics/umami";
import { AgentFloatingButton } from "@/features/app-shell/components/agent-floating-button";

// Authenticated app — keep out of search indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };
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
      <UmamiIdentify
        userId={session.user.id}
        role={session.user.role}
        username={session.user.username}
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={session.user} />
        {/* Extra bottom padding so the floating AI widget never overlaps
            page content (e.g. the bot danger zone). */}
        <main className="flex-1 overflow-x-clip px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-28">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AgentFloatingButton />
    </div>
  );
}
