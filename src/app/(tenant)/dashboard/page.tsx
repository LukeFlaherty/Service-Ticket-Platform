import type { Metadata } from "next";
import { requireOrg } from "@/lib/session";
import { getTicketCounts } from "@/server/queries/tickets";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  let orgData;
  try {
    orgData = await requireOrg();
  } catch {
    redirect("/sign-in");
  }

  const { org } = orgData!;
  const counts = await getTicketCounts(org.id);
  const recentTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.orgId, org.id))
    .orderBy(desc(tickets.createdAt))
    .limit(5);

  const stats = [
    { label: "Open", value: counts["open"] ?? 0, color: "text-blue-600" },
    { label: "In Progress", value: counts["in_progress"] ?? 0, color: "text-yellow-600" },
    { label: "Pending", value: counts["pending"] ?? 0, color: "text-orange-600" },
    { label: "Resolved", value: counts["resolved"] ?? 0, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500">Welcome back to {org.name}.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold tracking-tight ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-medium">Recent Tickets</h2>
          <Link href="/tickets" className="text-sm text-zinc-500 hover:text-zinc-900">
            View all →
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-400">
            No tickets yet.{" "}
            <Link href="/tickets" className="text-zinc-900 underline">
              Create the first one.
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {recentTickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tickets/${t.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 font-mono">#{t.number}</span>
                    <span className="text-sm font-medium truncate max-w-xs">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={t.status} />
                    <span className="text-xs text-zinc-400">{formatDate(t.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    pending: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-zinc-100 text-zinc-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.open}`}>
      {status.replace("_", " ")}
    </span>
  );
}
