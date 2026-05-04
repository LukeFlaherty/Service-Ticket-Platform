"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tickets, ticketComments } from "@/db/schema";
import { requireOrg } from "@/lib/session";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, count } from "drizzle-orm";

const createTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  dueAt: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export async function createTicket(input: CreateTicketInput) {
  const { org, user } = await requireOrg();
  const data = createTicketSchema.parse(input);

  // Get next sequential number for this org
  const [{ total }] = await db
    .select({ total: count() })
    .from(tickets)
    .where(eq(tickets.orgId, org.id));

  const ticket = await db
    .insert(tickets)
    .values({
      id: createId(),
      orgId: org.id,
      number: total + 1,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "open",
      createdById: user.id,
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      customFields: data.customFields ?? {},
    })
    .returning();

  revalidatePath("/tickets");
  return { ticket: ticket[0] };
}

export async function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "pending" | "resolved" | "closed"
) {
  const { org } = await requireOrg();

  await db
    .update(tickets)
    .set({
      status,
      resolvedAt: status === "resolved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, org.id)));

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
}

export async function assignTicket(ticketId: string, assignedToId: string | null) {
  const { org } = await requireOrg();

  await db
    .update(tickets)
    .set({ assignedToId, updatedAt: new Date() })
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, org.id)));

  revalidatePath(`/tickets/${ticketId}`);
}

export async function updateTicketPriority(
  ticketId: string,
  priority: "low" | "medium" | "high" | "urgent"
) {
  const { org } = await requireOrg();

  await db
    .update(tickets)
    .set({ priority, updatedAt: new Date() })
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, org.id)));

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
}

const addCommentSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function addComment(input: z.infer<typeof addCommentSchema>) {
  const { user, org } = await requireOrg();
  const { ticketId, body } = addCommentSchema.parse(input);

  const [ticket] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, org.id)))
    .limit(1);

  if (!ticket) throw new Error("Ticket not found");

  await db.insert(ticketComments).values({
    id: createId(),
    ticketId,
    orgId: org.id,
    body,
    authorId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/tickets/${ticketId}`);
}
