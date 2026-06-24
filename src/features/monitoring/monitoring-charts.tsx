"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Cpu, MemoryStick, Network, HardDrive } from "lucide-react";
import { Section } from "@/shared/components/common/section";
import type { MetricPoint, MonitoringRange, ProjectMonitoringHistory } from "@/shared/types/api";

// ─── Formatters ───────────────────────────────────────────────────────────────

function humanBytes(b: number | null | undefined): string {
  if (b == null || isNaN(b)) return "—";
  if (b === 0) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log2(b) / 10), u.length - 1);
  const v = b / Math.pow(1024, i);
  return `${v % 1 === 0 ? v : v.toFixed(1)} ${u[i]}`;
}

function humanBps(bps: number | null | undefined): string {
  if (bps == null || isNaN(bps)) return "—";
  return `${humanBytes(bps / 8)}/s`;
}

function humanCpu(cores: number | null | undefined): string {
  if (cores == null || isNaN(cores)) return "—";
  if (cores < 1) return `${Math.round(cores * 1000)} m`;
  return `${cores.toFixed(2)} vCPU`;
}

const UZ_MONTHS = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avg", "sen", "okt", "noy", "dek",
];

/** unix_ts (sekund) → range'ga mos vaqt yorlig'i. */
function formatTime(tsSeconds: number, range: MonitoringRange): string {
  const d = new Date(tsSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (range === "7d") return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
  return `${hh}:${mm}`;
}

function tooltipTime(tsSeconds: number): string {
  const d = new Date(tsSeconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]} ${hh}:${mm}`;
}

// ─── Generic single/dual area chart ───────────────────────────────────────────

type SeriesDef = { key: string; color: string; label: string; data: MetricPoint[] };

interface MetricChartProps {
  title: string;
  icon: React.ReactNode;
  range: MonitoringRange;
  series: SeriesDef[];
  format: (v: number) => string;
}

function MetricChart({ title, icon, range, series, format }: MetricChartProps) {
  // Merge series on timestamp into rows: { t, <key>: value, ... }
  const rowsByTs = new Map<number, Record<string, number>>();
  for (const s of series) {
    for (const [ts, val] of s.data) {
      const row = rowsByTs.get(ts) ?? { t: ts };
      row[s.key] = val;
      rowsByTs.set(ts, row);
    }
  }
  const rows = [...rowsByTs.values()].sort((a, b) => a.t - b.t);
  const hasData = rows.length > 0;
  const gradId = `grad-${series[0]?.key ?? title}`;

  return (
    <Section title={title} icon={icon}>
      {!hasData ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
          Ma&apos;lumot yo&apos;q
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${gradId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(t) => formatTime(t, range)}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={format}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-border/60 bg-[#0f0f18] px-3 py-2 shadow-xl">
                    <p className="mb-1 text-xs text-slate-400">{tooltipTime(label)}</p>
                    {payload.map((p: { dataKey: string; value: number; color: string }) => {
                      const def = series.find((s) => s.key === p.dataKey);
                      return (
                        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
                          {def?.label ? `${def.label}: ` : ""}
                          {format(p.value)}
                        </p>
                      );
                    })}
                  </div>
                );
              }}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${gradId}-${s.key})`}
                dot={false}
                activeDot={{ r: 4, fill: s.color, stroke: "#fff", strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Section>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function MonitoringCharts({ history }: { history: ProjectMonitoringHistory }) {
  const { series, range } = history;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MetricChart
        title="CPU tarixi"
        icon={<Cpu className="h-4 w-4 text-blue-400" />}
        range={range}
        format={humanCpu}
        series={[{ key: "cpu", color: "#3b82f6", label: "CPU", data: series.cpu_cores }]}
      />
      <MetricChart
        title="RAM tarixi"
        icon={<MemoryStick className="h-4 w-4 text-violet-400" />}
        range={range}
        format={humanBytes}
        series={[{ key: "mem", color: "#8b5cf6", label: "RAM", data: series.memory_bytes }]}
      />
      <MetricChart
        title="Tarmoq tarixi"
        icon={<Network className="h-4 w-4 text-emerald-400" />}
        range={range}
        format={humanBps}
        series={[
          { key: "rx", color: "#10b981", label: "↓ Qabul", data: series.net_rx_bps },
          { key: "tx", color: "#f59e0b", label: "↑ Yuborish", data: series.net_tx_bps },
        ]}
      />
      <MetricChart
        title="Disk tarixi"
        icon={<HardDrive className="h-4 w-4 text-orange-400" />}
        range={range}
        format={humanBytes}
        series={[{ key: "disk", color: "#f97316", label: "Disk", data: series.disk_bytes }]}
      />
    </div>
  );
}
