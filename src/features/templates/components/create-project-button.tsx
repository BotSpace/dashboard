"use client";

import { useTransition } from "react";
import { useRouter } from "@/shared/i18n/routing";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type Props = {
  slug: string;
  label: string;
};

export function CreateProjectButton({ slug, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="w-full"

      disabled={pending}
      onClick={() =>
        startTransition(() => router.push(`/app/templates/${slug}/create`))
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Rocket className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
