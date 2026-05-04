"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { requireOrg } from "@/lib/auth";
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
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export async function createTicket(input: CreateTicketInput) {
  const { org, userId } = await requireOrg();
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
      createdById: userId,
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
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
