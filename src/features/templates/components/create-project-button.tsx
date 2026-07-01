"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, ExternalLink, Plus, Boxes, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createProjectFromTemplateAction } from "@/features/templates/actions";
import { listCredentialsAction, listCredentialTypesAction, createCredentialAction } from "@/features/credentials/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { CredentialForm } from "@/features/credentials/components/credential-form";
import type { Credential, CredentialType, TemplateRequirements } from "@/shared/types/api";

type RequiredEnv = { key: string; description?: string };

type Labels = {
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
  // credentials
  requiredCredentialsTitle: string;
  credentialSelectPlaceholder: string;
  credentialCreateNew: string;
  credentialRequired: string;
  // modules
  modulesTitle: string;
  modulesNote: string;
  // loading
  loadingRequirements: string;
  credentialCreateTitle: string;
  credentialCreateDesc: string;
};

type Props = {
  templateId: number | string;
  defaultName: string;
  /** Legacy: static envs from template object (before requirements API) */
  requiredEnvs?: RequiredEnv[];
  /** Dynamic requirements fetched from /template-requirements/ */
  requirements?: TemplateRequirements;
  labels: Labels;
  constructorBasePath?: string;
};

// ---------------------------------------------------------------------------
// Inline credential selector for one required credential slot
// ---------------------------------------------------------------------------

interface CredentialSlotProps {
  logicalKey: string;
  typeKey: string;
  label: string;
  description?: string;
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  labels: Pick<Labels, "credentialSelectPlaceholder" | "credentialCreateNew" | "credentialCreateTitle" | "credentialCreateDesc" | "cancel">;
}

function CredentialSlot({
  logicalKey,
  typeKey,
  label,
  description,
  selectedId,
  onSelect,
  labels,
}: CredentialSlotProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credTypes, setCredTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [res, types] = await Promise.all([
        listCredentialsAction({ type_key: typeKey, page: 1, page_size: 50 }),
        credTypes.length === 0 ? listCredentialTypesAction() : Promise.resolve(credTypes),
      ]);
      setCredentials(res.results);
      if (credTypes.length === 0) setCredTypes(types);
    } catch {
      // keep empty list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeKey]);

  const handleCreated = (cred?: Credential) => {
    setCreateOpen(false);
    if (cred) {
      setCredentials((prev) => {
        const exists = prev.some((c) => c.id === cred.id);
        return exists ? prev : [cred, ...prev];
      });
      onSelect(cred.id);
    } else {
      load();
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`cred-slot-${logicalKey}`}>
        {label}
        <span className="ml-1 text-destructive">*</span>
      </Label>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Yuklanmoqda…</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <Select
            value={selectedId != null ? String(selectedId) : ""}
            onValueChange={(v) => onSelect(v)}
          >
            <SelectTrigger id={`cred-slot-${logicalKey}`} className="flex-1">
              <SelectValue placeholder={labels.credentialSelectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {credentials.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Credential yo&apos;q</div>
              ) : (
                credentials.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            title={labels.credentialCreateNew}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Inline create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{labels.credentialCreateTitle}</DialogTitle>
            <DialogDescription>{labels.credentialCreateDesc}</DialogDescription>
          </DialogHeader>
          <CredentialForm
            types={credTypes.filter((t) => t.key === typeKey)}
            onSuccess={handleCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CreateProjectButton
// ---------------------------------------------------------------------------

export function CreateProjectButton({
  templateId,
  defaultName,
  requiredEnvs,
  requirements,
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

  // Merge: requirements?.envs takes precedence; fall back to legacy requiredEnvs
  const envSpecs =
    (requirements?.envs?.length ?? 0) > 0
      ? (requirements!.envs ?? [])
      : (requiredEnvs ?? []);

  const [envValues, setEnvValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(envSpecs.map((e) => [e.key, ""]))
  );

  // credentials mapping: logical_key → credential_id
  const [credValues, setCredValues] = useState<Record<string, number | string>>({});

  const [pending, start] = useTransition();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(defaultName);
      setToken("");
      setEnvValues(Object.fromEntries(envSpecs.map((e) => [e.key, ""])));
      setCredValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const requiredCredentials = (requirements?.credentials ?? []).filter((c) => c.required);
  const modules = requirements?.modules ?? [];

  const hasEnvs = envSpecs.length > 0;
  const hasCredentials = requiredCredentials.length > 0;
  const hasModules = modules.length > 0;

  const allEnvsFilled = !hasEnvs || envSpecs.every((e) => envValues[e.key]?.trim());
  const allCredsFilled = !hasCredentials || requiredCredentials.every((c) => credValues[c.key] != null);

  const canSubmit = name.trim() && token.trim() && allEnvsFilled && allCredsFilled;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    start(async () => {
      const envs = hasEnvs
        ? Object.fromEntries(Object.entries(envValues).map(([k, v]) => [k, v.trim()]))
        : undefined;
      const credentials = hasCredentials ? credValues : undefined;

      const res = await createProjectFromTemplateAction({
        template: templateId,
        name: name.trim(),
        token: token.trim(),
        ...(envs ? { envs } : {}),
        ...(credentials ? { credentials } : {}),
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
      setEnvValues(Object.fromEntries(envSpecs.map((e) => [e.key, ""])));
      setCredValues({});
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Bot name */}
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

            {/* Token */}
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

            {/* Required envs */}
            {hasEnvs && (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">{labels.requiredEnvsTitle}</p>
                {envSpecs.map((env) => (
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

            {/* Required credentials */}
            {hasCredentials && (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">{labels.requiredCredentialsTitle}</p>
                {requiredCredentials.map((cred) => (
                  <CredentialSlot
                    key={cred.key}
                    logicalKey={cred.key}
                    typeKey={cred.type}
                    label={cred.label}
                    description={cred.description}
                    selectedId={credValues[cred.key] ?? null}
                    onSelect={(id) => setCredValues((prev) => ({ ...prev, [cred.key]: id }))}
                    labels={{
                      credentialSelectPlaceholder: labels.credentialSelectPlaceholder,
                      credentialCreateNew: labels.credentialCreateNew,
                      credentialCreateTitle: labels.credentialCreateTitle,
                      credentialCreateDesc: labels.credentialCreateDesc,
                      cancel: labels.cancel,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Modules info (read-only) */}
            {hasModules && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{labels.modulesTitle}</p>
                </div>
                <p className="text-xs text-muted-foreground">{labels.modulesNote}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {modules.map((m) => (
                    <Badge key={m.slug} variant="secondary" className="gap-1 text-xs">
                      <ChevronRight className="h-3 w-3" />
                      {m.slug}
                    </Badge>
                  ))}
                </div>
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
            <Button type="submit" disabled={pending || !canSubmit}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
