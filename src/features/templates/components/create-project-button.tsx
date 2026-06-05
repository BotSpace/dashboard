"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createProjectFromTemplateAction } from "@/features/templates/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

type RequiredEnv = { key: string; description?: string };

type Props = {
  templateId: number | string;
  defaultName: string;
  requiredEnvs?: RequiredEnv[];
  labels: {
    cta: string;
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    tokenLabel: string;
    tokenPlaceholder: string;
    tokenHelp: string;
    botFatherLink: string;
    submit: string;
    success: string;
    cancel: string;
    requiredEnvsTitle: string;
    envPlaceholder: string;
    envRequired: string;
  };
  constructorBasePath?: string;
};

export function CreateProjectButton({
  templateId,
  defaultName,
  requiredEnvs,
  labels,
  constructorBasePath = "/app/bots",
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: Props & { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const router = useRouter();
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = (v: boolean) => {
    setOpenInternal(v);
    onOpenChangeProp?.(v);
  };
  const [name, setName] = useState(defaultName);
  const [token, setToken] = useState("");
  const [envValues, setEnvValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((requiredEnvs ?? []).map((e) => [e.key, ""]))
  );
  const [pending, start] = useTransition();

  // Reset form when dialog opens via external control (openProp)
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setToken("");
      setEnvValues(Object.fromEntries((requiredEnvs ?? []).map((e) => [e.key, ""])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasEnvs = (requiredEnvs?.length ?? 0) > 0;
  const allEnvsFilled = !hasEnvs || (requiredEnvs ?? []).every((e) => envValues[e.key]?.trim());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allEnvsFilled) return;
    start(async () => {
      const envs = hasEnvs
        ? Object.fromEntries(
            Object.entries(envValues).map(([k, v]) => [k, v.trim()])
          )
        : undefined;
      const res = await createProjectFromTemplateAction({
        template: templateId,
        name: name.trim(),
        token: token.trim(),
        ...(envs ? { envs } : {}),
      });
      if (res.ok && res.project_id) {
        toast.success(labels.success);
        setOpen(false);
        const botId = res.project_uuid ?? res.project_id;
        router.push(`${constructorBasePath}/${botId}`);
        router.refresh();
      } else {
        toast.error(res.message ?? "Loyiha yaratishda xatolik");
      }
    });
  };

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (val) {
      setName(defaultName);
      setToken("");
      setEnvValues(Object.fromEntries((requiredEnvs ?? []).map((e) => [e.key, ""])));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Rocket className="h-4 w-4" />
          {labels.cta}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">{labels.nameLabel}</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.namePlaceholder}
                required
                maxLength={255}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-token">{labels.tokenLabel}</Label>
              <Input
                id="project-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={labels.tokenPlaceholder}
                required
                disabled={pending}
                spellCheck={false}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {labels.tokenHelp}{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  @BotFather <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            {hasEnvs && (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">{labels.requiredEnvsTitle}</p>
                {(requiredEnvs ?? []).map((env) => (
                  <div key={env.key} className="space-y-1.5">
                    <Label htmlFor={`env-${env.key}`}>
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {env.key}
                      </code>
                    </Label>
                    <Input
                      id={`env-${env.key}`}
                      value={envValues[env.key] ?? ""}
                      onChange={(e) =>
                        setEnvValues((prev) => ({ ...prev, [env.key]: e.target.value }))
                      }
                      placeholder={labels.envPlaceholder}
                      required
                      disabled={pending}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    {env.description && (
                      <p className="text-xs text-muted-foreground">{env.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {labels.cancel}
            </Button>
            <Button
              type="submit"
              disabled={pending || !name.trim() || !token.trim() || !allEnvsFilled}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
