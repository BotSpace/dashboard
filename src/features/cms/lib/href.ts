import type { CmsCollection } from "@/shared/types/api";

export function cmsCollectionHref(projectId: string, slug: string, suffix = ""): string {
  return `/app/bots/${encodeURIComponent(projectId)}/cms/${encodeURIComponent(slug)}${suffix}`;
}

export function cmsCollectionSlug(collection: CmsCollection): string {
  return collection.slug || collection.name;
}
