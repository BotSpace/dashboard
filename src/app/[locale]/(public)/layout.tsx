import { PublicHeader } from "@/features/landing/components/public-header";
import { PublicFooter } from "@/features/landing/components/public-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
