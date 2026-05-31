import { setRequestLocale } from "next-intl/server";
import { Activity } from "lucide-react";
import { Section } from "@/shared/components/common/section";

const METRICS = ["CPU", "RAM", "Traffic", "Disk"] as const;

export default async function MonitoringPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((k) => (
        <Section key={k} title={k} icon={<Activity className="h-4 w-4 text-violet-400" />}>
          <div className="text-3xl font-bold">—</div>
          <div className="mt-1 text-xs text-muted-foreground">Tez orada</div>
        </Section>
      ))}
    </div>
  );
}
