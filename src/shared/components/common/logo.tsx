"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (withText) {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src={isDark ? "/logo-dark.png" : "/logo-light.png"}
          alt="BotSpace"
          width={140}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={isDark ? "/logo-icon-dark.png" : "/logo-icon-light.png"}
        alt="BotSpace"
        width={36}
        height={36}
        className="h-8 w-8"
        priority
      />
    </div>
  );
}
