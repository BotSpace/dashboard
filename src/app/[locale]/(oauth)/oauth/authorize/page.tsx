import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/shared/i18n/routing";
import { readSession } from "@/shared/auth/session";
import { fetchOAuthMeta, type OAuthParams } from "@/features/oauth/oauth-consent-action";
import { OAuthConsent } from "@/features/oauth/oauth-consent";
import { OAuthErrorCard } from "@/features/oauth/oauth-error-card";

type SearchParams = {
  client_id?: string;
  redirect_uri?: string;
  response_type?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  state?: string;
  scope?: string;
  resource?: string;
};

export default async function OAuthAuthorizePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;

  // 1. Validate required query params
  const requiredFields: (keyof SearchParams)[] = [
    "client_id",
    "redirect_uri",
    "response_type",
    "code_challenge",
    "code_challenge_method",
  ];

  const missing = requiredFields.filter((k) => !sp[k]);
  if (missing.length > 0) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 pt-20">
        <OAuthErrorCard message={`Yaroqsiz OAuth so'rovi: ${missing.join(", ")} yetishmayapti`} />
      </div>
    );
  }

  const oauthParams: OAuthParams = {
    client_id: sp.client_id!,
    redirect_uri: sp.redirect_uri!,
    response_type: sp.response_type!,
    code_challenge: sp.code_challenge!,
    code_challenge_method: sp.code_challenge_method!,
    state: sp.state,
    scope: sp.scope,
    resource: sp.resource,
  };

  // 2. Validate via backend meta endpoint (AllowAny)
  const { meta, error: metaError } = await fetchOAuthMeta(oauthParams);
  if (metaError || !meta) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4 pt-20">
        <OAuthErrorCard message={metaError ?? "OAuth so'rovi tekshirishda xatolik"} />
      </div>
    );
  }

  // 3. Check session – redirect to login if not authenticated
  const session = await readSession();
  if (!session) {
    // Build the full OAuth URL to return to after login
    const currentPath = `/oauth/authorize`;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v) qs.set(k, v);
    }
    const returnTo = `${currentPath}?${qs.toString()}`;
    redirect({
      href: `/login?from=${encodeURIComponent(returnTo)}`,
      locale,
    });
    // redirect() throws internally, but TypeScript needs this for narrowing
    return null;
  }

  // 4. Render consent screen
  return (
    <div className="flex min-h-svh items-center justify-center px-4 pt-20">
      <OAuthConsent params={oauthParams} meta={meta} user={session.user} />
    </div>
  );
}
