import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { CopyButton } from "@/shared/components/common/copy-button";
import { DangerZone } from "@/features/bots/components/danger-zone";
import { formatLongDate } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";

export default async function BotOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bots.overview");
  const bot = await ProjectsAPI.get(id).catch(() => null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: Bot ma'lumotlari */}
      <div className="rounded-[14px] border border-border/[0.07] bg-card/[0.025] p-[22px]">
        <h3
          className="mb-[18px] text-[16px] font-semibold"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {t("info")}
        </h3>
        <div className="flex flex-col">
          <InfoRow label={t("name")} value={bot?.name} />
          <InfoRow
            label={t("username")}
            value={bot?.username ? `@${bot.username}` : undefined}
            hint={t("noUsername")}
          />
          <InfoRow
            label={t("description")}
            value={bot?.description || undefined}
            hint={t("noDescription")}
            wide
          />
          <InfoRow label={t("status")} value={bot?.status ?? "draft"} isStatus />
          <InfoRow
            label={t("id")}
            value={String(bot?.id ?? id)}
            mono
            copy
          />
          <InfoRow
            label={t("created")}
            value={
              bot?.created_at ? formatLongDate(bot.created_at, locale) : undefined
            }
            last
          />
        </div>
      </div>

      {/* Right col */}
      <div className="flex flex-col gap-4">
        {/* Tezkor statistika */}
        <div className="rounded-[14px] border border-border/[0.07] bg-card/[0.025] p-5">
          <h3
            className="mb-[14px] text-[15px] font-semibold"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {t("state")}
          </h3>
          <div className="flex flex-col gap-3">
            <StatRow label={t("status")} value={bot?.status ?? "draft"} />
            <StatRow label={t("id")} value={String(bot?.id ?? id)} mono />
            <StatRow
              label={t("created")}
              value={
                bot?.created_at
                  ? formatLongDate(bot.created_at, locale)
                  : undefined
              }
            />
          </div>
        </div>

        {/* Xavfli hudud */}
        <div className="rounded-[14px] border border-red-500/[0.18] bg-red-500/[0.05] p-5">
          <div className="mb-1.5 flex items-center gap-2">
            <AlertTriangle className="h-[17px] w-[17px] text-red-400" />
            <h3
              className="text-[14.5px] font-semibold text-red-300"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Xavfli hudud
            </h3>
          </div>
          <DangerZone id={id} locale={locale} name={bot?.name} compact />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copy,
  hint,
  mono,
  wide,
  last,
  isStatus,
}: {
  label: string;
  value?: string;
  copy?: boolean;
  hint?: string;
  mono?: boolean;
  wide?: boolean;
  last?: boolean;
  isStatus?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-6 py-3",
        !last && "border-b border-white/[0.05]"
      )}
    >
      <span className="shrink-0 text-[13.5px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-[13.5px] font-medium",
          wide && "text-right",
          mono && "font-mono"
        )}
      >
        {value ? (
          isStatus ? (
            <StatusValue status={value} />
          ) : (
            <span className="flex items-center gap-2">
              <span className={cn(wide ? "text-right text-foreground/80" : "text-foreground")}>
                {value}
              </span>
              {copy && <CopyButton value={value} className="p-1" />}
            </span>
          )
        ) : (
          <span className="text-xs italic text-muted-foreground/60">{hint ?? "—"}</span>
        )}
      </span>
    </div>
  );
}

function StatusValue({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-emerald-400">
        <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-amber-400">
      <span className="h-[5px] w-[5px] rounded-full bg-amber-400" />
      {status}
    </span>
  );
}

function StatRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-[14px] font-semibold",
          mono && "font-mono text-[13px]"
        )}
        style={{ fontFamily: mono ? undefined : "Space Grotesk, sans-serif" }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
