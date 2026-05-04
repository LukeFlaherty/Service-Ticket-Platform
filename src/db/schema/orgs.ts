import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(), // Clerk org ID
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  // Branding
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  // Billing / plan tier
  plan: text("plan", { enum: ["starter", "pro", "enterprise"] })
    .notNull()
    .default("starter"),
  // Custom domain support (e.g. tickets.acmecorp.com)
  customDomain: text("custom_domain").unique(),
  // Misc settings blob
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Org = typeof orgs.$inferSelect;
export type NewOrg = typeof orgs.$inferInsert;
