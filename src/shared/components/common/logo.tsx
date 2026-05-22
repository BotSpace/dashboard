import { cn } from "@/shared/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M4 7l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M4 12l8 4 8-4M4 17l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
      {withText && <span className="text-lg font-semibold tracking-tight">Botmother</span>}
    </div>
  );
}
