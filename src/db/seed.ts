import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "@better-auth/utils/password";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminId = createId();
  const adminPasswordHash = await hashPassword("lukefromwave");

  await db
    .insert(schema.user)
    .values({
      id: adminId,
      name: "Luke Flaherty",
      email: "luke@waveconsulting.biz",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.account)
    .values({
      id: createId(),
      accountId: adminId,
      providerId: "credential",
      userId: adminId,
      password: adminPasswordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log("✓ Admin user: luke@waveconsulting.biz / lukefromwave");

  // ── Fake user 1: Sarah Chen (Acme Corp) ────────────────────────────────────
  const user1Id = createId();
  const user1Password = await hashPassword("password123");
  const org1Id = createId();

  await db
    .insert(schema.user)
    .values({
      id: user1Id,
      name: "Sarah Chen",
      email: "sarah@acmecorp.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.account)
    .values({
      id: createId(),
      accountId: user1Id,
      providerId: "credential",
      userId: user1Id,
      password: user1Password,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.organization)
    .values({
      id: org1Id,
      name: "Acme Corp",
      slug: "acme-corp",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.member)
    .values({
      id: createId(),
      organizationId: org1Id,
      userId: user1Id,
      role: "owner",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.orgs)
    .values({
      id: org1Id,
      name: "Acme Corp",
      slug: "acme-corp",
      plan: "pro",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log("✓ User: sarah@acmecorp.com / password123 (Acme Corp)");

  // ── Fake user 2: Marcus Webb (TechStart Inc) ──────────────────────────────
  const user2Id = createId();
  const user2Password = await hashPassword("password123");
  const org2Id = createId();

  await db
    .insert(schema.user)
    .values({
      id: user2Id,
      name: "Marcus Webb",
      email: "marcus@techstart.io",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.account)
    .values({
      id: createId(),
      accountId: user2Id,
      providerId: "credential",
      userId: user2Id,
      password: user2Password,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.organization)
    .values({
      id: org2Id,
      name: "TechStart Inc",
      slug: "techstart-inc",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.member)
    .values({
      id: createId(),
      organizationId: org2Id,
      userId: user2Id,
      role: "owner",
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  await db
    .insert(schema.orgs)
    .values({
      id: org2Id,
      name: "TechStart Inc",
      slug: "techstart-inc",
      plan: "starter",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log("✓ User: marcus@techstart.io / password123 (TechStart Inc)");

  // ── Tickets for Acme Corp ──────────────────────────────────────────────────
  const acmeTickets = [
    {
      title: "Login page throws 500 on mobile browsers",
      description:
        "Users on iOS Safari are getting a 500 error when trying to sign in. Works fine on Chrome desktop. Happened after the last deploy.",
      status: "open" as const,
      priority: "urgent" as const,
      customerName: "Jamie Torres",
      customerEmail: "jamie@acmecorp.com",
    },
    {
      title: "Export CSV feature not including all records",
      description:
        "The CSV export cuts off after 500 rows. We have 2,400 records and need them all exported for the quarterly report.",
      status: "in_progress" as const,
      priority: "high" as const,
      customerName: "Dana Kim",
      customerEmail: "dana.kim@acmecorp.com",
    },
    {
      title: "Update billing address on account",
      description: "Need to change the billing address from 123 Main St to 456 Oak Ave, Suite 200.",
      status: "resolved" as const,
      priority: "low" as const,
      customerName: "Sam Patel",
      customerEmail: "sam@acmecorp.com",
    },
    {
      title: "Notifications not sending after 6pm",
      description:
        "Email notifications for new tickets stop going out after 6pm PST. We think it might be a cron job issue.",
      status: "pending" as const,
      priority: "medium" as const,
      customerName: "Jordan Lee",
      customerEmail: "jordan.lee@acmecorp.com",
    },
    {
      title: "Add support for dark mode in dashboard",
      description:
        "Multiple team members have requested a dark mode option for the main dashboard. Would reduce eye strain during night shifts.",
      status: "open" as const,
      priority: "low" as const,
      customerName: "Riley Nguyen",
      customerEmail: "riley@acmecorp.com",
    },
  ];

  for (let i = 0; i < acmeTickets.length; i++) {
    const t = acmeTickets[i];
    await db.insert(schema.tickets).values({
      id: createId(),
      orgId: org1Id,
      number: i + 1,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdById: user1Id,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      resolvedAt: t.status === "resolved" ? new Date() : null,
      createdAt: new Date(Date.now() - (acmeTickets.length - i) * 86_400_000),
      updatedAt: new Date(),
    }).onConflictDoNothing();
  }

  console.log("✓ 5 tickets for Acme Corp");

  // ── Tickets for TechStart Inc ──────────────────────────────────────────────
  const techTickets = [
    {
      title: "Onboarding flow skips step 3 intermittently",
      description:
        "New users occasionally skip the team setup step during onboarding. Cannot reproduce reliably — happens about 1 in 5 times.",
      status: "open" as const,
      priority: "high" as const,
      customerName: "Alex Rivera",
      customerEmail: "alex@techstart.io",
    },
    {
      title: "API rate limit documentation is outdated",
      description:
        "The docs still say 100 req/min but we upgraded to 500 req/min last month. Customers keep throttling themselves unnecessarily.",
      status: "resolved" as const,
      priority: "medium" as const,
      customerName: "Casey Morgan",
      customerEmail: "casey@techstart.io",
    },
    {
      title: "Webhook payloads missing `org_id` field",
      description:
        "Outbound webhooks for ticket.created events are missing the org_id field. Breaking our downstream integrations.",
      status: "in_progress" as const,
      priority: "urgent" as const,
      customerName: "Taylor Brooks",
      customerEmail: "taylor.brooks@techstart.io",
    },
    {
      title: "Request bulk ticket import from spreadsheet",
      description:
        "We have 300 historical support tickets in a Google Sheet that we'd like to import. Can we get a bulk import tool or template?",
      status: "pending" as const,
      priority: "low" as const,
      customerName: "Morgan Ellis",
      customerEmail: "morgan@techstart.io",
    },
  ];

  for (let i = 0; i < techTickets.length; i++) {
    const t = techTickets[i];
    await db.insert(schema.tickets).values({
      id: createId(),
      orgId: org2Id,
      number: i + 1,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdById: user2Id,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      resolvedAt: t.status === "resolved" ? new Date() : null,
      createdAt: new Date(Date.now() - (techTickets.length - i) * 86_400_000),
      updatedAt: new Date(),
    }).onConflictDoNothing();
  }

  console.log("✓ 4 tickets for TechStart Inc");
  console.log("\nDone! Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
