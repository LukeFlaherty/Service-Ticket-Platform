import { db } from "@/db";
import { tickets, ticketComments, user } from "@/db/schema";
import { eq, and, desc, count, asc } from "drizzle-orm";
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

export const getComments = cache(async (orgId: string, ticketId: string) => {
  return db
    .select({
      id: ticketComments.id,
      body: ticketComments.body,
      authorId: ticketComments.authorId,
      authorName: user.name,
      isInternal: ticketComments.isInternal,
      createdAt: ticketComments.createdAt,
    })
    .from(ticketComments)
    .innerJoin(user, eq(ticketComments.authorId, user.id))
    .where(and(eq(ticketComments.ticketId, ticketId), eq(ticketComments.orgId, orgId)))
    .orderBy(asc(ticketComments.createdAt));
});

export const getTicketCounts = cache(async (orgId: string) => {
  const rows = await db
    .select({ status: tickets.status, total: count() })
    .from(tickets)
    .where(eq(tickets.orgId, orgId))
    .groupBy(tickets.status);

  return Object.fromEntries(rows.map((r) => [r.status, r.total]));
});
