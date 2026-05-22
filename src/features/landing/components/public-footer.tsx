import { useTranslations } from "next-intl";
import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";

export function PublicFooter() {
  const t = useTranslations("landing.footer");
  const tn = useTranslations("landing");
  const year = new Date().getFullYear();

  const groups = [
    {
      title: t("product"),
      items: [
        { label: t("docs"), href: "/docs" },
        { label: tn("navTemplates"), href: "/templates" },
      ],
    },
    {
      title: t("company"),
      items: [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
        { label: t("blog"), href: "/blog" },
      ],
    },
    {
      title: t("legal"),
      items: [
        { label: t("terms"), href: "/terms" },
        { label: t("privacy"), href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        {groups.map((g) => (
          <div key={g.title} className="space-y-3">
            <div className="text-sm font-semibold">{g.title}</div>
            <ul className="space-y-2">
              {g.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page py-6 text-xs text-muted-foreground">
          © {year} Botmother. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
