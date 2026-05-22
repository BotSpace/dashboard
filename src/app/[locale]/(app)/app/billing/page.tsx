import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { PlansAPI, BillingAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils";

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("billing");

  const [plans, balanceRes, history] = await Promise.all([
    PlansAPI.list().catch(() => []),
    BillingAPI.balance().catch(() => ({ balance: 0, currency: "UZS" })),
    BillingAPI.history().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{t("balance")}</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(balanceRes.balance ?? 0, balanceRes.currency ?? "UZS", locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm">{t("addFunds")}</Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("currentPlan")}</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tariflar yuklanmadi</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id} className={p.is_default ? "border-primary ring-2 ring-primary/30" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    {p.is_default && <Badge>Joriy</Badge>}
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
                  <Button variant={p.is_default ? "outline" : "default"} className="w-full" size="sm">
                    {p.is_default ? "Joriy" : t("upgrade")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("history")}</h2>
        <Card>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t("noHistory")}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Sana</th>
                    <th className="px-4 py-3 text-left">Tur</th>
                    <th className="px-4 py-3 text-right">Miqdor</th>
                    <th className="px-4 py-3 text-left">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">{h.created_at ?? "—"}</td>
                      <td className="px-4 py-3">{h.type ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(h.amount, h.currency ?? "UZS", locale)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{h.status ?? "—"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
