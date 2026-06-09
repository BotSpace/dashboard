import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Link } from "@/shared/i18n/routing";
import { NewTicketForm } from "@/features/tickets/components/new-ticket-form";

export default async function NewTicketPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tickets");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t("new")}
        icon={<LifeBuoy className="h-5 w-5" />}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/app/tickets">
              <ArrowLeft className="h-4 w-4" /> Orqaga
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="py-6">
          <NewTicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
