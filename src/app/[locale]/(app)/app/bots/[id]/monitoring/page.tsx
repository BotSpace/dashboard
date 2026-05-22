import { setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {(["CPU", "RAM", "Traffic", "Disk"] as const).map((k) => (
        <Card key={k}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{k}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <div className="mt-1 text-xs text-muted-foreground">Tez orada</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
