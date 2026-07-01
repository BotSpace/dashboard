"use client";

import { useState, useEffect } from "react";
import { getTemplateRequirementsAction } from "@/features/templates/actions";
import { OrderButton } from "./order-button";
import { CreateProjectButton } from "./create-project-button";
import type { TemplateRequirements } from "@/shared/types/api";

type RequiredEnv = { key: string; description?: string };

type Props = {
  templateId: number | string;
  templateName: string;
  isFree: boolean;
  isOwned: boolean;
  requiredEnvs?: RequiredEnv[];
  orderLabels: {
    buy: string;
    use: string;
    owned: string;
    success: string;
    error: string;
  };
  createLabels: {
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
    requiredCredentialsTitle: string;
    credentialSelectPlaceholder: string;
    credentialCreateNew: string;
    credentialRequired: string;
    modulesTitle: string;
    modulesNote: string;
    loadingRequirements: string;
    credentialCreateTitle: string;
    credentialCreateDesc: string;
  };
};

export function TemplateActions({
  templateId,
  templateName,
  isFree,
  isOwned: isOwnedInitial,
  requiredEnvs,
  orderLabels,
  createLabels,
}: Props) {
  const [owned, setOwned] = useState(isOwnedInitial);
  const [createOpen, setCreateOpen] = useState(false);
  const [requirements, setRequirements] = useState<TemplateRequirements | null>(null);

  // Fetch requirements once the user owns the template and the dialog is about to open
  const fetchRequirements = async () => {
    if (requirements) return; // already fetched
    try {
      const res = await getTemplateRequirementsAction(templateId);
      if (res.ok) setRequirements(res.data);
    } catch {
      // fail silently — fall back to legacy requiredEnvs
    }
  };

  // Pre-fetch when user owns the template (already owned on page load)
  useEffect(() => {
    if (owned) fetchRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owned]);

  function handleOrdered() {
    setOwned(true);
    setCreateOpen(true);
    fetchRequirements();
  }

  return (
    <>
      <OrderButton
        templateId={templateId}
        isFree={isFree}
        isOwned={owned}
        labels={orderLabels}
        onOrdered={handleOrdered}
      />

      {owned && (
        <CreateProjectButton
          templateId={templateId}
          defaultName={templateName}
          requiredEnvs={requiredEnvs}
          requirements={requirements ?? undefined}
          labels={{
            ...createLabels,
            // While requirements are loading, show spinner hint in description — noop here,
            // the dialog itself handles the case gracefully with what it has.
          }}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </>
  );
}
