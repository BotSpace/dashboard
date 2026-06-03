import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

type Props = {
  message: string;
};

export function OAuthErrorCard({ message }: Props) {
  return (
    <Card className="w-full max-w-md border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-white/80">OAuth xatoligi</p>
          <p className="text-[13px] text-white/50">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
