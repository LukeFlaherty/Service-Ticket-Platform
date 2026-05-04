import { db } from "@/db";
import { orgFeatures, type FeatureId } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Returns the set of enabled feature IDs for an org.
 * React cache() deduplicates within a single request.
 */
export const getOrgFeatures = cache(async (orgId: string): Promise<Set<FeatureId>> => {
  const rows = await db
    .select({ featureId: orgFeatures.featureId })
    .from(orgFeatures)
    .where(and(eq(orgFeatures.orgId, orgId), eq(orgFeatures.enabled, true)));

  return new Set(rows.map((r) => r.featureId as FeatureId));
});

export async function hasFeature(orgId: string, featureId: FeatureId): Promise<boolean> {
  const features = await getOrgFeatures(orgId);
  return features.has(featureId);
}
