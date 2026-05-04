import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { cache } from "react";

export const getTickets = cache(
  async (orgId: string, status?: string) => {
    const conditions = [eq(tickets.orgId, orgId)];
    if (status) conditions.push(eq(tickets.status, status as "open"));

    return db
      .select()
      .from(tickets)
      .where(and(...conditions))
      .orderBy(desc(tickets.createdAt));
  }
);

export const getTicket = cache(async (orgId: string, ticketId: string) => {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.orgId, orgId)))
    .limit(1);

  return ticket ?? null;
});

export const getTicketCounts = cache(async (orgId: string) => {
  const rows = await db
    .select({ status: tickets.status, total: count() })
    .from(tickets)
    .where(eq(tickets.orgId, orgId))
    .groupBy(tickets.status);

  return Object.fromEntries(rows.map((r) => [r.status, r.total]));
});
