import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";

export function CtaBanner() {
  const t = useTranslations("landing.cta");
  return (
    <section id="contact" className="container-page py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-fuchsia-500/10 px-8 py-16 text-center md:px-16">
        <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_top,oklch(0.618_0.213_264_/_0.25),transparent_60%)]" />
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/login" className="gap-2">
              {t("button")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
