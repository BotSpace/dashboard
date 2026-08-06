import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-side action(s) */
  actions?: React.ReactNode;
  /** Optional leading icon (renders to the left of title) */
  icon?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, icon, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1 pr-2 sm:w-auto sm:shrink-0 sm:flex-nowrap sm:gap-2 sm:pr-0">
          {actions}
        </div>
      )}
    </header>
  );
}
