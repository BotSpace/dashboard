import { getTranslations, setRequestLocale } from "next-intl/server";
import { Settings, User, Shield, KeyRound, Mail, Phone } from "lucide-react";
import { readSession } from "@/shared/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { APITokensPanel } from "@/features/settings/components/api-tokens";
import { PageHeader } from "@/shared/components/common/page-header";
import { initials } from "@/shared/lib/utils";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  const session = await readSession();
  const user = session?.user;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "—";
  const avatar = (user as { avatar?: string } | undefined)?.avatar;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={t("title")} icon={<Settings className="h-5 w-5" />} />

      {/* Identity header */}
      <Card className="relative overflow-hidden border-border/60">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent" />
        <CardContent className="relative flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-border/50">
            {avatar && <AvatarImage src={avatar} alt={fullName} />}
            <AvatarFallback className="text-lg font-semibold">{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{fullName}</h2>
            <div className="mt-1 flex flex-col items-center gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
              {user?.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {user.phone}
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-1.5">
            <User className="h-4 w-4" /> {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" /> {t("tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="tokens" className="gap-1.5">
            <KeyRound className="h-4 w-4" /> {t("tabs.tokens")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" /> {t("tabs.general")}
              </CardTitle>
              <CardDescription>Ism, familiya va aloqa ma&apos;lumotlaringizni boshqaring.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                defaultFirstName={user?.first_name}
                defaultLastName={user?.last_name}
                defaultEmail={user?.email}
                defaultPhone={user?.phone}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" /> {t("changePassword")}
              </CardTitle>
              <CardDescription>Hisobingiz xavfsizligi uchun kuchli, takrorlanmas parol tanlang.</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400" /> {t("tabs.tokens")}
              </CardTitle>
              <CardDescription>
                Tashqi xizmatlar (MCP, CI/CD, monitoring) BotSpace&apos;ga ulanish uchun API tokenlar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APITokensPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
