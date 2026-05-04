import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { getTickets } from "@/server/queries/tickets";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tickets" };

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-zinc-100 text-zinc-600",
};

export default async function TicketsPage() {
  let orgData;
  try {
    orgData = await requireOrg();
  } catch {
    redirect("/sign-in");
  }

  const { org } = orgData!;
  const allTickets = await getTickets(org.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-zinc-500">{allTickets.length} total</p>
        </div>
        <CreateTicketDialog />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-16">#</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Priority</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allTickets.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{t.number}</td>
                <td className="px-4 py-3">
                  <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {t.customerName ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[t.priority]}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
            {allTickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                  No tickets yet. Create your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
