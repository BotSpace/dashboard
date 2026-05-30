"use client";

import { useState, useTransition } from "react";
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

type Props = {
  templateId: number | string;
  defaultName: string;
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
  };
  constructorBasePath?: string;
};

export function CreateProjectButton({
  templateId,
  defaultName,
  labels,
  constructorBasePath = "/app/projects",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [token, setToken] = useState("");
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await createProjectFromTemplateAction({
        template: templateId,
        name: name.trim(),
        token: token.trim(),
      });
      if (res.ok && res.project_id) {
        toast.success(labels.success);
        setOpen(false);
        router.push(`${constructorBasePath}/${res.project_id}`);
        router.refresh();
      } else {
        toast.error(res.message ?? "Loyiha yaratishda xatolik");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Rocket className="h-4 w-4" />
          {labels.cta}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
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
            <Button type="submit" disabled={pending || !name.trim() || !token.trim()}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
