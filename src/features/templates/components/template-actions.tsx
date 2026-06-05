"use client";

import { useState } from "react";
import { OrderButton } from "./order-button";
import { CreateProjectButton } from "./create-project-button";

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

  function handleOrdered() {
    setOwned(true);
    setCreateOpen(true);
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
          labels={createLabels}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </>
  );
}
