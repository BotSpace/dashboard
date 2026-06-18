import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Info,
  KeyRound,
  Key,
  Shield,
  Mail,
  Table,
  Folder,
  Send,
  User,
  Globe,
  List,
} from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Badge } from "@/shared/components/ui/badge";
import { Section } from "@/shared/components/common/section";
import { CredentialsAPI } from "@/shared/api/services";
import { getCredentialAction } from "@/features/credentials/actions";
import { EditableCredentialName } from "@/features/credentials/components/editable-credential-name";
import { CredentialDetailActions } from "@/features/credentials/components/credential-detail-actions";
import { formatLongDate } from "@/shared/lib/utils";
import type { CredentialType } from "@/shared/types/api";

// ---------------------------------------------------------------------------
// Icon map (mirrors credential-form.tsx)
// ---------------------------------------------------------------------------
type LucideIconComponent = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, LucideIconComponent> = {
  key: Key,
  shield: Shield,
  mail: Mail,
  table: Table,
  folder: Folder,
  send: Send,
  user: User,
  globe: Globe,
  list: List,
};

function getTypeIcon(iconName: string | undefined): LucideIconComponent {
  if (!iconName) return Key;
  return ICON_MAP[iconName] ?? Key;
}

// ---------------------------------------------------------------------------
// Info row (mirrors bot overview row)
// ---------------------------------------------------------------------------
function Row({ label, value, hint }: { label: string; value?: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right">
        {value ? (
          <span className="break-all font-medium">{value}</span>
        ) : (
          <span className="text-xs italic text-muted-foreground/70">{hint ?? "—"}</span>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function CredentialDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [credential, types] = await Promise.all([
    getCredentialAction(id),
    CredentialsAPI.listTypes().catch((): CredentialType[] => []),
  ]);

  if (!credential) notFound();

  const credType = types.find((t) => t.key === credential.type_key);
  const TypeIcon = getTypeIcon(credType?.icon);
  const isOAuth = credential.type?.mode === "oauth2";
  const accountEmail = credential.data?.account_email;
  const scope = credential.data?.scope;

  // Non-oauth data fields to display (skip oauth-internal fields)
  const oauthInternalKeys = new Set(["account_email", "scope", "access_token", "refresh_token"]);
  const dataEntries = !isOAuth
    ? Object.entries(credential.data ?? {}).filter(([k]) => !oauthInternalKeys.has(k))
    : [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/app/credentials"
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Credentials
      </Link>

      {/* Header card */}
      <header className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400 ring-2 ring-blue-500/20">
          <TypeIcon className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <EditableCredentialName id={credential.id} initialName={credential.name} />
            <Badge variant="secondary" className="text-[11px] shrink-0">
              {credential.type?.label ?? credential.type_key}
            </Badge>
          </div>
          {isOAuth && accountEmail && (
            <p className="mt-0.5 text-sm text-muted-foreground">{accountEmail}</p>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Main info section */}
        {isOAuth ? (
          <Section
            title="OAuth ulanish"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            contentClassName="space-y-3 text-sm"
          >
            <Row label="Holat" value="Ulangan" />
            {accountEmail && <Row label="Hisob" value={accountEmail} />}
            {scope && (
              <div className="border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <p className="mb-1.5 text-muted-foreground">Huquqlar</p>
                <div className="flex flex-wrap gap-1.5">
                  {scope.split(/[\s,]+/).filter(Boolean).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] font-mono">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>
        ) : (
          <Section
            title="Ma'lumotlar"
            icon={<Info className="h-4 w-4 text-blue-400" />}
            contentClassName="space-y-3 text-sm"
          >
            {dataEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Ma'lumot yo'q</p>
            ) : (
              dataEntries.map(([key, val]) => {
                const fieldDef = credType?.fields.find((f) => f.name === key);
                const label = fieldDef?.label ?? key;
                const isSecret = fieldDef?.secret ?? false;
                const displayVal = isSecret
                  ? typeof val === "string" && val
                    ? "••••••••"
                    : undefined
                  : (val as string) || undefined;
                return (
                  <Row key={key} label={label} value={displayVal} hint="(bo'sh)" />
                );
              })
            )}
          </Section>
        )}

        {/* Meta section */}
        <Section
          title="Meta"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          contentClassName="space-y-3 text-sm"
        >
          <Row label="ID" value={String(credential.id)} />
          <Row label="Tur" value={credential.type?.label ?? credential.type_key} />
          <Row label="Rejim" value={credential.type?.mode ?? "—"} />
          <Row
            label="Yangilangan"
            value={credential.updated_at ? formatLongDate(credential.updated_at, locale) : undefined}
            hint="—"
          />
        </Section>
      </div>

      {/* Action buttons + dialogs */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold leading-none">Amallar</span>
        </div>
        <CredentialDetailActions credential={credential} types={types} locale={locale} />
      </div>
    </div>
  );
}
