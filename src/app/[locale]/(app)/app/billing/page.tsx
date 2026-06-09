import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, CheckCircle2, CreditCard, Sparkles, Zap } from "lucide-react";
import { SubscriptionAPI, PlansAPI, BillingAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { PageHeader } from "@/shared/components/common/page-header";
import { formatCurrency } from "@/shared/lib/utils";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const PLAN_ICONS: Record<string, typeof Sparkles> = {
  free: Zap,
  pro: Sparkles,
  max: Bot,
};

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("billing");

  const [subscription, usage, plans, balanceRes, history] = await Promise.all([
    SubscriptionAPI.current().catch(() => null),
    SubscriptionAPI.usage().catch(() => null),
    PlansAPI.list().catch(() => []),
    BillingAPI.balance().catch(() => ({ balance: 0, currency: "UZS" })),
    BillingAPI.history().catch(() => []),
  ]);

  const currentPlanName = (subscription as { plan?: { name?: string } })?.plan?.name ?? "free";
  const tokensUsed =
    usage?.ai_token_usage?.used ?? (usage ? usage.tokens_used_input + usage.tokens_used_output : 0);
  const tokensLimit =
    usage?.ai_token_usage?.limit ??
    (usage ? usage.tokens_limit_input + usage.tokens_limit_output : 200_000);
  const tokensRemaining = usage?.ai_token_usage?.remaining ?? usage?.tokens_remaining ?? tokensLimit;
  const inputUsed = usage?.ai_token_usage?.input_used ?? usage?.tokens_used_input ?? 0;
  const outputUsed = usage?.ai_token_usage?.output_used ?? usage?.tokens_used_output ?? 0;
  const botsCount = usage?.bots_count ?? 0;
  const maxBots = usage?.max_bots ?? 1;
  const tokenPct = tokensLimit > 0 ? (tokensUsed / tokensLimit) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        icon={<CreditCard className="h-5 w-5" />}
      />

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current plan */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>{t("currentPlan")}</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl capitalize">
              {currentPlanName}
              {currentPlanName !== "free" && (
                <Badge variant="default" className="text-xs">
                  {(subscription as { status?: string })?.status === "active" ? "Faol" : (subscription as { status?: string })?.status}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {maxBots === 0 ? "Cheksiz botlar" : `${botsCount} / ${maxBots} bot`}
            </p>
          </CardContent>
        </Card>

        {/* Token usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI Token iste&apos;moli (oylik)</CardDescription>
            <CardTitle className="text-2xl">
              {formatTokens(tokensUsed)} / {formatTokens(tokensLimit)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={tokensUsed} max={tokensLimit} />
            <p className="text-xs text-muted-foreground">
              Qolgan: {formatTokens(tokensRemaining)} token
            </p>
            <p className="text-xs text-muted-foreground">
              Input: {formatTokens(inputUsed)} · Output: {formatTokens(outputUsed)}
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("balance")}</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(balanceRes.balance ?? 0, balanceRes.currency ?? "UZS", locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="">
              {t("addFunds")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plans grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tariflar</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.name === currentPlanName;
            const Icon = PLAN_ICONS[p.name] ?? Zap;
            const planMaxBots = (p as { max_bots?: number }).max_bots ?? 1;
            const planMaxTokens =
              ((p as { max_input_tokens?: number }).max_input_tokens ?? 0) +
                ((p as { max_output_tokens?: number }).max_output_tokens ?? 0) || 200_000;

            return (
              <Card
                key={p.id}
                className={
                  isCurrent
                    ? "border-blue-500/40 ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg capitalize">{p.name_display ?? p.name}</CardTitle>
                    </div>
                    {isCurrent && <Badge className="bg-blue-600 text-white border-none">Joriy</Badge>}
                  </div>
                  <div className="mt-2 text-3xl font-bold">
                    {p.price > 0 ? `$${p.price}` : "Bepul"}
                    {p.price > 0 && <span className="text-sm font-normal text-muted-foreground">/oy</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{formatTokens(planMaxTokens)} AI token/oy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{planMaxBots === 0 ? "Cheksiz" : planMaxBots} bot</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Vizual konstruktor</span>
                    </li>
                    {p.name !== "free" && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Priority support</span>
                      </li>
                    )}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    className={
                      isCurrent
                        ? "w-full"
                        : "w-full"
                    }
                    size="sm"
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Joriy tarif" : t("upgrade")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Payment history */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("history")}</h2>
        <Card>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t("noHistory")}</p>
            ) : (
              <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm">
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
                    <tr key={h.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
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
              </table></div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
