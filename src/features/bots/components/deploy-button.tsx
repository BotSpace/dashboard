"use client";
import { useTransition } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deployReleaseAction } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";

export function DeployButton({ projectId }: { projectId: string | number }) {
  const [pending, start] = useTransition();
  const onClick = () => {
    start(async () => {
      try {
        await deployReleaseAction(projectId);
        toast.success("Deploy boshlandi");
      } catch {
        toast.error("Deploy muvaffaqiyatsiz");
      }
    });
  };
  return (
    <Button onClick={onClick} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
      Deploy
    </Button>
  );
}
