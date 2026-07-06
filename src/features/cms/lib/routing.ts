import { redirect } from "next/navigation";
import { CmsAPI } from "@/shared/api/services";
import type { CmsCollection } from "@/shared/types/api";
import { cmsCollectionHref, cmsCollectionSlug } from "./href";

export { cmsCollectionHref, cmsCollectionSlug };

export async function getCollectionByRouteParam(
  projectId: string,
  routeParam: string,
  suffix = ""
): Promise<CmsCollection | null> {
  const direct = await CmsAPI.getCollection(projectId, routeParam).catch(() => null);
  if (direct) return direct;

  const collections = await CmsAPI.listCollections(projectId).catch(() => []);
  const match = collections.find((c) => c.slug === routeParam || c.name === routeParam);
  if (!match) return null;

  redirect(cmsCollectionHref(projectId, cmsCollectionSlug(match), suffix));
}
