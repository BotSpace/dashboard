import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { readSession } from "@/shared/auth/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const authenticated = !!(await readSession());
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-deep text-white">
      <PublicHeader authenticated={authenticated} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
