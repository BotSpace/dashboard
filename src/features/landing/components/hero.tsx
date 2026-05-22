import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";

export function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.6_0.18_280_/_0.20)_0%,transparent_70%)]" />
      </div>
      <div className="container-page py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("badge")}
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="gradient-text">{t("title")}</span>
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login" className="gap-2">
                {t("ctaPrimary")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">{t("ctaSecondary")}</a>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div>{t("stats.users")}</div>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/50 sm:inline-block" />
            <div>{t("stats.bots")}</div>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/50 sm:inline-block" />
            <div>{t("stats.uptime")}</div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/40 to-background shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs text-muted-foreground">app.botmother.uz</span>
            </div>
            <div className="aspect-[16/9] bg-[radial-gradient(circle_at_30%_30%,oklch(0.618_0.213_264_/_0.10),transparent_60%),radial-gradient(circle_at_70%_70%,oklch(0.7_0.18_320_/_0.10),transparent_60%)]">
              <div className="grid h-full place-items-center text-sm text-muted-foreground/70">
                Bot Constructor Preview
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
