import { Bot, Database, Globe2, LineChart, ShoppingBag, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Workflow, Bot, ShoppingBag, Globe2, Database, LineChart];

export function Features() {
  const t = useTranslations("landing.features");
  // 6 items in i18n
  const items = Array.from({ length: 6 }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
    Icon: icons[i],
  }));

  return (
    <section id="features" className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ title, desc, Icon }) => (
          <div
            key={title}
            className="group relative rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
