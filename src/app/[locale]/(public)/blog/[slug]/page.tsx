import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { BlogAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { BlogMarkdown } from "@/features/blog/components/blog-markdown";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await BlogAPI.get(slug).catch(() => null);
  if (!post) {
    return { title: t("title") };
  }
  return {
    title: post.title,
    description: post.excerpt || t("metaDescriptionFallback"),
    openGraph: {
      title: post.title,
      description: post.excerpt || t("metaDescriptionFallback"),
      type: "article",
    },
  };
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const post = await BlogAPI.get(slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-10 space-y-6">
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
          {post.published_at && <span>{formatDate(post.published_at, locale)}</span>}
          {post.published_at && <span>·</span>}
          <span>{t("readingTime", { min: post.reading_time })}</span>
        </div>
      </header>

      <BlogMarkdown>{post.content}</BlogMarkdown>
    </article>
  );
}
