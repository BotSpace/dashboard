import { setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { PlansAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";

export default async function BotPlanPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [plans, current] = await Promise.all([
    PlansAPI.list().catch(() => []),
    PlansAPI.current(id).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Joriy tarif</h2>
      <Card>
        <CardHeader>
          <CardTitle>{current?.name ?? "—"}</CardTitle>
        </CardHeader>
        <CardContent>
          {current ? (
            <div className="text-2xl font-bold">
              {formatCurrency(current.price, current.currency ?? "UZS", locale)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tarif tanlanmagan</p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Tarifni o'zgartirish</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = current?.id === p.id;
          return (
            <Card key={p.id} className={isCurrent ? "border-primary ring-2 ring-primary/30" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  {isCurrent && <Badge>Joriy</Badge>}
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(p.price, p.currency ?? "UZS", locale)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5 text-sm">
                  {(p.features ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={isCurrent ? "outline" : "default"} className="w-full" size="sm" disabled={isCurrent}>
                  {isCurrent ? "Joriy" : "Tanlash"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
