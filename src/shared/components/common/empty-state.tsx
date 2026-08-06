import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  /** Icon element — will be centered in a rounded bg box */
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** CTA element — a Button for example */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-4 py-14 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
