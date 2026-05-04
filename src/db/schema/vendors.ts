// Feature-gated: only available when FEATURE_IDS.VENDOR_MANAGEMENT is enabled
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  category: text("category"), // e.g. "plumbing", "electrical"
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
