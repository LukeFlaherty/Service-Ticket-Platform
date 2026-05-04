import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

// Master catalog of all available features / modules
export const features = pgTable("features", {
  id: text("id").primaryKey(), // e.g. "vendor_management", "ghl_integration"
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("addon"), // core | addon | integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Which features are enabled per org (toggles)
export const orgFeatures = pgTable("org_features", {
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  featureId: text("feature_id")
    .notNull()
    .references(() => features.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  enabledAt: timestamp("enabled_at").defaultNow().notNull(),
});

export type Feature = typeof features.$inferSelect;
export type OrgFeature = typeof orgFeatures.$inferSelect;

// Canonical feature IDs — single source of truth
export const FEATURE_IDS = {
  VENDOR_MANAGEMENT: "vendor_management",
  GHL_INTEGRATION: "ghl_integration",
  CUSTOM_FORMS: "custom_forms",
  EMAIL_NOTIFICATIONS: "email_notifications",
  SMS_NOTIFICATIONS: "sms_notifications",
  PDF_REPORTS: "pdf_reports",
  API_ACCESS: "api_access",
  WHITE_LABEL: "white_label",
} as const;

export type FeatureId = (typeof FEATURE_IDS)[keyof typeof FEATURE_IDS];
