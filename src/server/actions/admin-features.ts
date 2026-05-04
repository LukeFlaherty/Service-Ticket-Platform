"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orgFeatures } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

async function requireInternalAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthenticated");
  if (!session.user.email?.endsWith("@waveconsulting.biz")) {
    throw new Error("Forbidden");
  }
  return session;
}

const toggleSchema = z.object({
  orgId: z.string().min(1),
  featureId: z.string().min(1),
  enabled: z.boolean(),
});

export async function toggleOrgFeature(input: z.infer<typeof toggleSchema>) {
  await requireInternalAdmin();
  const { orgId, featureId, enabled } = toggleSchema.parse(input);

  await db
    .insert(orgFeatures)
    .values({ orgId, featureId, enabled })
    .onConflictDoUpdate({
      target: [orgFeatures.orgId, orgFeatures.featureId],
      set: { enabled },
    });

  revalidatePath("/admin/features");
  return { ok: true };
}
