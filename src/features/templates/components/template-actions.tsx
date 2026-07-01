"use client";

import { useState } from "react";
import { OrderButton } from "./order-button";
import { CreateProjectButton } from "./create-project-button";

type Props = {
  templateId: number | string;
  templateSlug: string;
  isFree: boolean;
  isOwned: boolean;
  orderLabels: {
    buy: string;
    use: string;
    owned: string;
    success: string;
    error: string;
  };
  createLabel: string;
};

export function TemplateActions({
  templateId,
  templateSlug,
  isFree,
  isOwned: isOwnedInitial,
  orderLabels,
  createLabel,
}: Props) {
  const [owned, setOwned] = useState(isOwnedInitial);

  function handleOrdered() {
    setOwned(true);
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
        <CreateProjectButton slug={templateSlug} label={createLabel} />
      )}
    </>
  );
}
