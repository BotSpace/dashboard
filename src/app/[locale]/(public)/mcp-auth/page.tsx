import { setRequestLocale } from "next-intl/server";
import { MCPAuthForm } from "@/features/mcp-auth/mcp-auth-form";

export default async function MCPAuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; callback?: string; redirect_uri?: string; state?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <MCPAuthForm
        code={sp.code ?? ""}
        callback={sp.callback ?? ""}
        redirectUri={sp.redirect_uri ?? ""}
        state={sp.state ?? ""}
      />
    </div>
  );
}
