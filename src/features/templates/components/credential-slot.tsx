"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { listCredentialsAction, listCredentialTypesAction } from "@/features/credentials/actions";
import { CredentialForm } from "@/features/credentials/components/credential-form";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Credential, CredentialType } from "@/shared/types/api";

export interface CredentialSlotLabels {
  credentialSelectPlaceholder: string;
  credentialCreateNew: string;
  credentialCreateTitle: string;
  credentialCreateDesc: string;
  cancel: string;
}

export interface CredentialSlotProps {
  logicalKey: string;
  typeKey: string;
  label: string;
  description?: string;
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  labels: CredentialSlotLabels;
}

export function CredentialSlot({
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
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Credential yo&apos;q
                </div>
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
