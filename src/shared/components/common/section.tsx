import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface SectionProps {
  title?: React.ReactNode;
  /** Small icon to the left of title */
  icon?: React.ReactNode;
  /** Right-side actions */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Extra classes for the inner content wrapper */
  contentClassName?: string;
}

export function Section({
  title,
  icon,
  actions,
  children,
  className,
  contentClassName,
}: SectionProps) {
  const hasHeader = title || icon || actions;
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-border",
        className
      )}
    >
      {hasHeader && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="shrink-0 text-muted-foreground">{icon}</span>
            )}
            {title && (
              <span className="font-semibold leading-none">{title}</span>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
          )}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
