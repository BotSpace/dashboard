import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { BlogAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { BlogMarkdown } from "@/features/blog/components/blog-markdown";
import { formatLongDate } from "@/shared/lib/utils";
import { buildMetadata } from "@/shared/lib/seo";
import type { Locale } from "@/shared/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function withoutDuplicateTitle(content: string, title: string): string {
  const firstHeading = content.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
  if (!firstHeading || firstHeading[1].trim() !== title.trim()) return content;
  return content.slice(firstHeading[0].length).trimStart();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await BlogAPI.get(slug).catch(() => null);
  if (!post) {
    return { title: t("title"), robots: { index: false, follow: true } };
  }
  const description = post.excerpt || t("metaDescriptionFallback");
  const meta = buildMetadata({
    locale: locale as Locale,
    path: `/blog/${slug}`,
    title: post.title,
    description,
    type: "article",
  });
  meta.openGraph = {
    ...meta.openGraph,
    type: "article",
    publishedTime: post.published_at ?? undefined,
    authors: post.author_name ? [post.author_name] : undefined,
  };
  return meta;
}


export default async function BlogDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const post = await BlogAPI.get(slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl space-y-6 pb-12 pt-28 md:pt-32">
      <Button asChild variant="ghost" size="sm">
        <Link href="/blog" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </Button>

      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/40">
          {post.author_name && <span>{post.author_name}</span>}
          {post.author_name && <span>·</span>}
          {post.published_at && <span>{formatLongDate(post.published_at, locale)}</span>}
          {post.published_at && <span>·</span>}
          <span>{t("readingTime", { min: post.reading_time })}</span>
        </div>
      </header>

      <BlogMarkdown>{withoutDuplicateTitle(post.content, post.title)}</BlogMarkdown>
    </article>
  );
}
