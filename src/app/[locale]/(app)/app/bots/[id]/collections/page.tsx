import { setRequestLocale } from "next-intl/server";
import { Database } from "lucide-react";
import { CollectionsAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Link } from "@/shared/i18n/routing";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const items = await CollectionsAPI.list(id).catch(() => []);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-3 py-16">
            <Database className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Hech qanday collection yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/app/bots/${id}/collections/${c.id}`}
              className="rounded-xl border bg-card p-5 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <span className="font-medium">{c.name}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{c.schema?.length ?? 0} ustun</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
