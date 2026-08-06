"use client";
import { useTransition } from "react";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { orderTemplateAction } from "@/features/templates/actions";
import { analytics } from "@/shared/analytics/umami";
import { Button } from "@/shared/components/ui/button";

type Props = {
  templateId: number | string;
  isFree: boolean;
  isOwned: boolean;
  labels: {
    buy: string;
    use: string;
    owned: string;
    success: string;
    error: string;
  };
  onOrdered?: () => void;
};

export function OrderButton({ templateId, isFree, isOwned, labels, onOrdered }: Props) {
  const [pending, start] = useTransition();

  if (isOwned) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        <Check className="h-4 w-4" />
        {labels.owned}
      </Button>
    );
  }

  const onClick = () => {
    start(async () => {
      const res = await orderTemplateAction(templateId);
      if (res.ok) {
        analytics.templateOrdered({ template: String(templateId), free: isFree });
        toast.success(labels.success);
        onOrdered?.();
      } else {
        analytics.templateOrdered({
          template: String(templateId),
          free: isFree,
          ok: false,
          reason: res.message || "unknown",
        });
        toast.error(res.message || labels.error);
      }
    });
  };

  return (
    <Button onClick={onClick} disabled={pending} className="w-full">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
      {isFree ? labels.use : labels.buy}
    </Button>
  );
}
