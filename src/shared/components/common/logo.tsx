import Image from "next/image";
import { cn } from "@/shared/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  if (withText) {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src="/logo-dark.png"
          alt="BotSpace"
          width={480}
          height={120}
          className="w-full h-auto"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo-icon-dark.png"
        alt="BotSpace"
        width={80}
        height={80}
        className="h-12 w-12"
        priority
      />
    </div>
  );
}
