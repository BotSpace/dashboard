"use client";
import { usePathname } from "next/navigation";

/** Har sahifa o'tishida yengil fade-in (pathname o'zgarganda qayta animatsiya). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="motion-safe:animate-[page-enter_220ms_ease-out]">
      {children}
    </div>
  );
}
