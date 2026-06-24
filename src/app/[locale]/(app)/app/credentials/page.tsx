import { setRequestLocale } from "next-intl/server";
import { CredentialsAPI } from "@/shared/api/services";
import { CredentialsPanel } from "@/features/credentials/components/credentials-panel";

export default async function CredentialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [types, initialData] = await Promise.all([
    CredentialsAPI.listTypes().catch(() => []),
    CredentialsAPI.list({ page: 1, page_size: 20 }).catch(() => ({
      results: [],
      total_items: 0,
      total_pages: 1,
      current_page: 1,
      page_size: 20,
    })),
  ]);

  return <CredentialsPanel initialData={initialData} types={types} />;
}
