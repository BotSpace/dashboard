import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, ChevronRight, Clock, LifeBuoy, Plus } from "lucide-react";
import { TicketsAPI } from "@/shared/api/services";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/routing";
import { EmptyState } from "@/shared/components/common/empty-state";

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; label: string; icon: typeof Clock }
> = {
  open: {
    bg: "rgba(234,179,8,.12)",
    color: "#facc15",
    label: "open",
    icon: Clock,
  },
  pending: {
    bg: "rgba(234,179,8,.12)",
    color: "#facc15",
    label: "pending",
    icon: Clock,
  },
  closed: {
    bg: "rgba(34,197,94,.1)",
    color: "#4ade80",
    label: "closed",
    icon: CheckCircle2,
  },
};

export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tickets");
  const items = await TicketsAPI.list().catch(() => []);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: 600,
                fontSize: 27,
                margin: "0 0 5px",
                letterSpacing: "-0.6px",
              }}
            >
              {t("title")}
            </h1>
            <p style={{ margin: 0, color: "#8a8a93", fontSize: 14 }}>
              Qo&apos;llab-quvvatlash so&apos;rovlari va tiketlar
            </p>
          </div>
          <Button asChild style={{ gap: 8 }}>
            <Link href="/app/tickets/new">
              <Plus style={{ width: 15, height: 15 }} />
              {t("new")}
            </Link>
          </Button>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy style={{ width: 28, height: 28 }} />}
          title={t("empty")}
          action={
            <Button asChild style={{ gap: 8 }}>
              <Link href="/app/tickets/new">
                <Plus style={{ width: 15, height: 15 }} />
                {t("new")}
              </Link>
            </Button>
          }
        />
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {items.map((tk, idx) => {
            const cfg = STATUS_CONFIG[tk.status] ?? STATUS_CONFIG.open;
            const statusLabel = t.has(tk.status) ? t(tk.status as "open" | "closed" | "pending") : tk.status;
            const userInfo = [tk.last_message?.sender, tk.created_at].filter(Boolean).join(" • ");

            return (
              <Link
                key={tk.id}
                href={`/app/tickets/${tk.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom:
                    idx < items.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                className="tickets-row"
              >
                {/* Ticket ID */}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12.5,
                    color: "#71717a",
                    flex: "0 0 50px",
                  }}
                >
                  #{tk.id}
                </span>

                {/* Subject + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "#e7e7ea",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tk.subject}
                  </div>
                  <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>
                    {userInfo || "—"}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: cfg.bg,
                    color: cfg.color,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: cfg.color,
                      flexShrink: 0,
                    }}
                  />
                  {statusLabel}
                </span>

                {/* Chevron */}
                <ChevronRight
                  style={{ width: 16, height: 16, color: "#5a5a63", flexShrink: 0 }}
                />
              </Link>
            );
          })}
        </div>
      )}

      {/* Hover effect via global style */}
      <style>{`
        .tickets-row:hover {
          background: rgba(255,255,255,.02) !important;
        }
      `}</style>
    </div>
  );
}
