import { Check } from "lucide-react";

// Generic horizontal (desktop) / dot (mobile) step indicator, extracted from
// the template-create wizard so any multi-step wizard (template create,
// blank-bot create, ...) can share the exact same look & feel. Takes plain
// label strings instead of a StepId union so it has no knowledge of any
// particular wizard's steps.

interface WizardStepperProps {
  steps: string[];
  currentIndex: number;
}

export function WizardStepper({ steps, currentIndex }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Desktop: horizontal */}
      <ol className="hidden sm:flex items-center gap-0">
        {steps.map((label, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          const isLast = idx === steps.length - 1;

          return (
            <li key={label + idx} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    active
                      ? "text-foreground"
                      : done
                        ? "text-foreground/70"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "h-0.5 flex-1 mx-2 mb-5 transition-colors",
                    done ? "bg-primary" : "bg-muted-foreground/20",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact dots + step name */}
      <div className="flex sm:hidden items-center gap-3">
        <div className="flex gap-1.5">
          {steps.map((label, idx) => (
            <div
              key={label + idx}
              className={[
                "h-1.5 rounded-full transition-all",
                idx < currentIndex
                  ? "w-4 bg-primary"
                  : idx === currentIndex
                    ? "w-6 bg-primary"
                    : "w-4 bg-muted-foreground/30",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{steps[currentIndex]}</span>
      </div>
    </nav>
  );
}
