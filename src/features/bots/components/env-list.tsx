"use client";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addEnvAction, removeEnvAction } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Section } from "@/shared/components/common/section";
import { EmptyState } from "@/shared/components/common/empty-state";
import type { EnvVar } from "@/shared/types/api";

export function EnvList({ projectId, items }: { projectId: string | number; items: EnvVar[] }) {
  const [showValues, setShowValues] = useState<Record<string | number, boolean>>({});
  const [state, action, pending] = useActionState<{ ok: boolean; message?: string } | undefined, FormData>(
    addEnvAction,
    undefined
  );
  const [removing, start] = useTransition();

  useEffect(() => {
    if (state?.ok === false && state?.message) toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <Section
        icon={<Plus className="h-4 w-4" />}
        title="Yangi env var qo'shish"
      >
        <form action={action} className="flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="project" value={String(projectId)} />
          <Input name="key" placeholder="KEY" className="font-mono uppercase sm:max-w-xs" required />
          <Input name="value" placeholder="qiymat" className="font-mono flex-1" />
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Qo'shish
          </Button>
        </form>
      </Section>

      <Section
        icon={<KeyRound className="h-4 w-4" />}
        title="Mavjud o'zgaruvchilar"
        contentClassName="p-0 -mx-5 -mb-5"
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="h-6 w-6" />}
            title="Hech qanday env var yo'q"
            description="Yuqoridagi forma orqali birinchi o'zgaruvchingizni qo'shing"
            className="border-0 rounded-none bg-transparent py-10"
          />
        ) : (
          <ul className="divide-y">
            {items.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-sm font-medium">{e.key}</span>
                <span className="font-mono flex-1 truncate text-sm text-muted-foreground">
                  {showValues[e.id] ? e.value : "•".repeat(Math.min(20, e.value?.length ?? 8))}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowValues((s) => ({ ...s, [e.id]: !s[e.id] }))}
                  aria-label="Toggle visibility"
                >
                  {showValues[e.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={removing}
                  onClick={() =>
                    start(async () => {
                      try {
                        await removeEnvAction(e.key, projectId);
                        toast.success("O'chirildi");
                      } catch {
                        toast.error("O'chirishda xatolik");
                      }
                    })
                  }
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
