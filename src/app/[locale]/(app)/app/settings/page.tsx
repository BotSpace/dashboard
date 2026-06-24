import { getTranslations, setRequestLocale } from "next-intl/server";
import { Shield, KeyRound, User } from "lucide-react";
import { readSession } from "@/shared/auth/session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { APITokensPanel } from "@/features/settings/components/api-tokens";
import { initials } from "@/shared/lib/utils";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  const session = await readSession();
  const user = session?.user;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "—";
  const avatar = (user as { avatar?: string } | undefined)?.avatar;
  const avatarInitials = initials(fullName);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 760 }}>
      {/* Page title */}
      <h1
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 600,
          fontSize: 27,
          margin: "0 0 24px",
          letterSpacing: "-0.6px",
          color: "var(--foreground)",
        }}
      >
        {t("title")}
      </h1>

      {/* Profil card */}
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 22,
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: 15,
            margin: "0 0 18px",
            color: "var(--foreground)",
          }}
        >
          {t("tabs.general")}
        </h3>

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              style={{ width: 60, height: 60, borderRadius: 15, objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 15,
                background: "linear-gradient(150deg,#3b82f6,#1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 22,
                color: "#fff",
                fontFamily: "Space Grotesk",
                flexShrink: 0,
              }}
            >
              {avatarInitials}
            </div>
          )}
        </div>

        {/* Profile form */}
        <ProfileForm
          defaultFirstName={user?.first_name}
          defaultLastName={user?.last_name}
          defaultEmail={user?.email}
          defaultPhone={user?.phone}
        />
      </div>

      {/* Tabs: Xavfsizlik + API tokenlar */}
      <Tabs defaultValue="security">
        <TabsList
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: "4px",
            marginBottom: 12,
          }}
        >
          <TabsTrigger
            value="security"
            style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 600 }}
          >
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            {t("tabs.security")}
          </TabsTrigger>
          <TabsTrigger
            value="tokens"
            style={{ fontFamily: "Space Grotesk", fontSize: 13, fontWeight: 600 }}
          >
            <KeyRound className="h-3.5 w-3.5 mr-1.5" />
            {t("tabs.tokens")}
          </TabsTrigger>
        </TabsList>

        {/* Xavfsizlik tab */}
        <TabsContent value="security">
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <h3
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: 600,
                fontSize: 15,
                margin: "0 0 16px",
                color: "var(--foreground)",
              }}
            >
              {t("changePassword")}
            </h3>
            <PasswordForm />
          </div>
        </TabsContent>

        {/* API tokenlar tab */}
        <TabsContent value="tokens">
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: 22,
            }}
          >
            <h3
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: 600,
                fontSize: 15,
                margin: "0 0 4px",
                color: "var(--foreground)",
              }}
            >
              {t("tabs.tokens")}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted-foreground)",
                margin: "0 0 16px",
              }}
            >
              Tashqi xizmatlar (MCP, CI/CD, monitoring) BotSpace&apos;ga ulanish uchun API tokenlar.
            </p>
            <APITokensPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
