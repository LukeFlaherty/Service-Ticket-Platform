import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { orgs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Gets the current user's active Clerk org and verifies it exists in our DB.
 * Throws if not authenticated or org not found.
 */
export const requireOrg = cache(async () => {
  const { userId, orgId } = await auth();

  if (!userId) throw new Error("Unauthenticated");
  if (!orgId) throw new Error("No active organization");

  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);
  if (!org) throw new Error("Organization not found");

  return { userId, org };
});

export const requireUser = cache(async () => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");
  return user;
});

/**
 * Check if the current user has the "admin" role in their org (Clerk role).
 */
export async function requireOrgAdmin() {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) throw new Error("Unauthenticated");
  if (orgRole !== "org:admin") throw new Error("Forbidden: admin only");
  return { userId, orgId };
}
