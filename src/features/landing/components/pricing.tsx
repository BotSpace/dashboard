import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type PlanCard = {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
};

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const plans: PlanCard[] = [
    {
      name: "Starter",
      price: "0",
      features: ["1 bot", "1K xabar / oy", "Asosiy konstruktor", "Marketplace shablonlar"],
    },
    {
      name: "Pro",
      price: "99 000",
      features: ["10 bot", "100K xabar / oy", "AI agent", "Maxsus domain", "Prioritet support"],
      highlighted: true,
    },
    {
      name: "Business",
      price: "499 000",
      features: [
        "Cheksiz bot",
        "Cheksiz xabar",
        "Maxsus integratsiya",
        "SLA 99.9%",
        "Maxsus menejer",
      ],
    },
  ];

  return (
    <section id="pricing" className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={cn(
              "relative rounded-xl border bg-card p-8 shadow-sm",
              p.highlighted && "border-primary shadow-lg ring-2 ring-primary/30"
            )}
          >
            {p.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                {t("popular")}
              </div>
            )}
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">{p.price}</span>
              <span className="text-sm text-muted-foreground">UZS{t("perMonth")}</span>
            </div>
            <Button className="mt-6 w-full" variant={p.highlighted ? "default" : "outline"} asChild>
              <Link href="/login">{t("cta")}</Link>
            </Button>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
