import { setRequestLocale } from "next-intl/server";
import { Cpu, MemoryStick, Network, HardDrive } from "lucide-react";
import { Section } from "@/shared/components/common/section";
import { ProjectsAPI } from "@/shared/api/services";
import type {
  ProjectMonitoring,
  ProjectMonitoringHistory,
  MonitoringRange,
} from "@/shared/types/api";
import { MonitoringCharts } from "@/features/monitoring/monitoring-charts";
import { RangeSelector } from "@/features/monitoring/range-selector";

// ─── Helpers ────────────────────────────────────────────────────────────────

function humanBytes(bytes: number | null | undefined): string {
  if (bytes == null || isNaN(bytes)) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return `${val % 1 === 0 ? val : val.toFixed(1)} ${units[i]}`;
}

function humanBps(bps: number | null | undefined): string {
  if (bps == null || isNaN(bps)) return "—";
  return `${humanBytes(bps / 8)}/s`;
}

function humanCpu(cores: number | null | undefined): string {
  if (cores == null || isNaN(cores)) return "—";
  if (cores < 1) {
    // millicores
    return `${Math.round(cores * 1000)} m`;
  }
  return `${cores.toFixed(2)} vCPU`;
}

// ─── Metric Card ────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subValue?: string;
  unavailable?: boolean;
}

function MetricCard({ title, icon, value, subValue, unavailable }: MetricCardProps) {
  return (
    <Section title={title} icon={icon}>
      <div className="text-3xl font-bold tabular-nums">
        {unavailable ? (
          <span className="text-muted-foreground text-lg">Mavjud emas</span>
        ) : (
          value
        )}
      </div>
      {!unavailable && subValue && (
        <div className="mt-1 text-xs text-muted-foreground">{subValue}</div>
      )}
    </Section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function MonitoringPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale, id } = await params;
  const { range: rangeParam } = await searchParams;
  setRequestLocale(locale);

  const range: MonitoringRange = (["1h", "6h", "24h", "7d"] as const).includes(
    rangeParam as MonitoringRange,
  )
    ? (rangeParam as MonitoringRange)
    : "24h";

  let data: ProjectMonitoring | null = null;
  let history: ProjectMonitoringHistory | null = null;
  try {
    [data, history] = await Promise.all([
      ProjectsAPI.monitoring(id),
      ProjectsAPI.monitoringHistory(id, range).catch(() => null),
    ]);
  } catch {
    // endpoint tayyor bo'lmasa yoki xato bo'lsa — null saqlab qolamiz
  }

  const prometheusOk = data?.prometheus_available === true;

  return (
    <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* CPU */}
      <MetricCard
        title="CPU"
        icon={<Cpu className="h-4 w-4 text-blue-400" />}
        value={humanCpu(data?.cpu_cores)}
        subValue="millicores"
        unavailable={!prometheusOk}
      />

      {/* RAM */}
      <MetricCard
        title="RAM"
        icon={<MemoryStick className="h-4 w-4 text-violet-400" />}
        value={humanBytes(data?.memory_bytes)}
        unavailable={!prometheusOk}
      />

      {/* Traffic */}
      <Section
        title="Tarmoq"
        icon={<Network className="h-4 w-4 text-emerald-400" />}
      >
        {!prometheusOk ? (
          <div className="text-lg text-muted-foreground">Mavjud emas</div>
        ) : (
          <>
            <div className="text-3xl font-bold tabular-nums">
              {data ? humanBps((data.net_rx_bps ?? 0) + (data.net_tx_bps ?? 0)) : "—"}
            </div>
            <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
              <span>↓ {humanBps(data?.net_rx_bps)}</span>
              <span>↑ {humanBps(data?.net_tx_bps)}</span>
            </div>
          </>
        )}
      </Section>

      {/* Disk */}
      <Section
        title="Disk"
        icon={<HardDrive className="h-4 w-4 text-orange-400" />}
      >
        <div className="text-3xl font-bold tabular-nums">
          {humanBytes(data?.disk_bytes)}
        </div>
        {(data?.disk_files_bytes != null || data?.disk_cms_bytes != null) && (
          <div className="mt-2 text-xs text-muted-foreground">
            Fayllar: {humanBytes(data?.disk_files_bytes)} &bull; CMS:{" "}
            {humanBytes(data?.disk_cms_bytes)}
          </div>
        )}
      </Section>
    </div>

      {/* Tarix chartlari */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Tarix</h2>
          <RangeSelector current={range} />
        </div>
        {history ? (
          <MonitoringCharts history={history} />
        ) : (
          <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            Tarix ma&apos;lumotlari hozircha mavjud emas.
          </div>
        )}
      </div>
    </div>
  );
}
