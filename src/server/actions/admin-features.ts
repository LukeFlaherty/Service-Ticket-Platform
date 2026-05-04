"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orgFeatures } from "@/db/schema";
import { requireOrgAdmin } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

// Only callable by internal admin (middleware enforces domain check,
// but we double-check here as a defense-in-depth measure)
async function requireInternalAdmin() {
  const { sessionClaims } = await auth();
  const email = sessionClaims?.email as string | undefined;
  if (!email?.endsWith("@waveconsulting.biz")) {
    throw new Error("Forbidden");
  }
}

const toggleSchema = z.object({
  orgId: z.string().min(1),
  featureId: z.string().min(1),
  enabled: z.boolean(),
});

export async function toggleOrgFeature(input: z.infer<typeof toggleSchema>) {
  await requireInternalAdmin();
  const { orgId, featureId, enabled } = toggleSchema.parse(input);

  // Upsert: insert if not exists, update if does
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
