import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/shared/auth/session";
import { UmamiIdentify } from "@/shared/analytics/umami";
import { AgentFloatingButton } from "@/features/app-shell/components/agent-floating-button";
import { OnboardingClient } from "@/features/onboarding/onboarding-client";

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
    <div className="dashboard-shell flex min-h-svh bg-background">
      <UmamiIdentify
        userId={session.user.id}
        role={session.user.role}
        username={session.user.username}
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <TopBar user={session.user} />
        {/* Extra bottom padding keeps the floating AI widget clear of page content. */}
        <main className="flex-1 overflow-x-clip px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-7 lg:pb-28">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <AgentFloatingButton />
      <OnboardingClient firstName={session.user.first_name} />
    </div>
  );
}
