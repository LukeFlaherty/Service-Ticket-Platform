import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { orgs } from "./orgs";

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(), // cuid2 generated
  orgId: text("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  // Ticket identity
  number: integer("number").notNull(), // sequential per org
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["open", "in_progress", "pending", "resolved", "closed"],
  })
    .notNull()
    .default("open"),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] })
    .notNull()
    .default("medium"),
  // Relationships (Clerk user IDs)
  createdById: text("created_by_id").notNull(),
  assignedToId: text("assigned_to_id"),
  // Optional customer (not necessarily a Clerk user)
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  // Flexible custom fields per org (stored as JSON)
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default({}),
  // Timestamps
  dueAt: timestamp("due_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketAttachments = pgTable("ticket_attachments", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  orgId: text("org_id").notNull(), // denormalized for faster RLS-style queries
  fileName: text("file_name").notNull(),
  blobUrl: text("blob_url").notNull(), // Vercel Blob URL
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  uploadedById: text("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketComments = pgTable("ticket_comments", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  orgId: text("org_id").notNull(),
  body: text("body").notNull(),
  authorId: text("author_id").notNull(),
  // Internal note (not visible to end customer)
  isInternal: text("is_internal").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type TicketComment = typeof ticketComments.$inferSelect;
