import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { formatLongDate } from "@/shared/lib/utils";
import { buildMetadata } from "@/shared/lib/seo";
import type { Locale } from "@/shared/i18n/routing";

// Postlar ro'yxati har so'rovda backenddan yangilanib turishi uchun dinamik.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/blog",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function BlogListPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const page = Number(sp.page ?? 1);
  const result = await BlogAPI.list({ page }).catch(() => null);
  const posts = result?.results ?? [];

  return (
    <div className="container-page space-y-8 pb-12 pt-28 md:pt-32">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-lg text-white/60">{t("subtitle")}</p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-16 text-center text-sm text-white/50">
          {t("notFound")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
            >
              <h2 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-primary">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-white/60">{post.excerpt}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
                {post.published_at && <span>{formatLongDate(post.published_at, locale)}</span>}
                {post.published_at && <span>·</span>}
                <span>{t("readingTime", { min: post.reading_time })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
