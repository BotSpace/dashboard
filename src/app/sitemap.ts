import type { MetadataRoute } from "next";
import { BlogAPI, TemplatesAPI } from "@/shared/api/services";
import { languageAlternates, localizedUrl } from "@/shared/lib/seo";
import { routing } from "@/shared/i18n/routing";

// Har so'rovda JONLI generatsiya (build-vaqtida bakelanmasin). ISR (revalidate)
// build paytida bir marta snapshot oladi — agar shu payt backend flaky bo'lsa
// (masalan deploy churn) noto'g'ri/chala ro'yxat image ichiga muzlab qoladi va
// revalidate muddatigacha (soat) shunday qolardi. Sitemap kamdan-kam (crawler)
// so'raladi, shuning uchun har so'rovda jonli API to'g'ri va arzon.
export const dynamic = "force-dynamic";

type EntryOpts = {
  lastModified?: Date;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

function entry(path: string, opts: EntryOpts = {}): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl(routing.defaultLocale, path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.6,
    alternates: { languages: languageAlternates(path) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/templates", { changeFrequency: "daily", priority: 0.9 }),
    entry("/blog", { changeFrequency: "daily", priority: 0.7 }),
    entry("/docs/mcp", { changeFrequency: "monthly", priority: 0.6 }),
  ];

  // list() emas listAll() — list() paginatsiya sabab faqat 1-sahifani (10 ta)
  // qaytaradi, sitemapga barcha template kirishi kerak.
  const templates = await TemplatesAPI.listAll().catch(() => []);
  const templateSlugs = [...new Set(templates.map((t) => t.slug).filter(Boolean))];
  const templateEntries: MetadataRoute.Sitemap = templateSlugs.map((slug) =>
    entry(`/templates/${slug}`, { changeFrequency: "weekly", priority: 0.7 })
  );

  const blog = await BlogAPI.list({ page: 1 }).catch(() => null);
  const blogEntries: MetadataRoute.Sitemap = (blog?.results ?? [])
    .filter((p) => p.slug)
    .map((p) =>
      entry(`/blog/${p.slug}`, {
        lastModified: p.published_at ? new Date(p.published_at) : undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    );

  return [...staticEntries, ...templateEntries, ...blogEntries];
}
