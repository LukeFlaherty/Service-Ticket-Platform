import { auth } from "./auth";
import { db } from "@/db";
import { orgs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { headers } from "next/headers";

export const requireAuth = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthenticated");
  return session;
});

export const requireOrg = cache(async () => {
  const session = await requireAuth();
  const orgId = session.session.activeOrganizationId;
  if (!orgId) throw new Error("NO_ORG");

  const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1);

  // Org exists in Better Auth but not yet in our orgs table — sync it
  if (!org) {
    const authOrg = await auth.api.getFullOrganization({
      query: { organizationId: orgId },
      headers: await headers(),
    });
    if (!authOrg) throw new Error("Organization not found");

    const [synced] = await db
      .insert(orgs)
      .values({ id: orgId, name: authOrg.name, slug: authOrg.slug ?? orgId })
      .onConflictDoNothing()
      .returning();

    return { user: session.user, session: session.session, org: synced };
  }

  return { user: session.user, session: session.session, org };
});

export const requireOrgAdmin = async () => {
  const { user, org } = await requireOrg();
  const membership = await auth.api.getActiveMember({ headers: await headers() });
  if (membership?.role !== "owner" && membership?.role !== "admin") {
    throw new Error("Forbidden: admin only");
  }
  return { user, org };
};
