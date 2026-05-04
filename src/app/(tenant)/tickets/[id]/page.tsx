import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { getTicket } from "@/server/queries/tickets";
import { updateTicketStatus } from "@/server/actions/tickets";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Ticket ${id.slice(0, 8)}` };
}

const STATUS_OPTIONS = ["open", "in_progress", "pending", "resolved", "closed"] as const;
const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let orgData;
  try {
    orgData = await requireOrg();
  } catch {
    redirect("/sign-in");
  }

  const { org } = orgData!;
  const ticket = await getTicket(org.id, id);
  if (!ticket) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tickets" className="text-zinc-400 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-zinc-400 font-mono">#{ticket.number}</span>
        <h1 className="text-xl font-semibold">{ticket.title}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main info */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-medium text-zinc-500">Description</h2>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">
              {ticket.description ?? <span className="text-zinc-400">No description provided.</span>}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Status</p>
              <form>
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  onChange={async (e) => {
                    "use server";
                    await updateTicketStatus(id, e.target.value as typeof STATUS_OPTIONS[number]);
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </form>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Priority</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                {ticket.priority}
              </span>
            </div>

            {ticket.customerName && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Customer</p>
                <p className="text-sm font-medium">{ticket.customerName}</p>
                {ticket.customerEmail && (
                  <p className="text-xs text-zinc-500">{ticket.customerEmail}</p>
                )}
                {ticket.customerPhone && (
                  <p className="text-xs text-zinc-500">{ticket.customerPhone}</p>
                )}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Created</p>
              <p className="text-xs text-zinc-600">{formatDateTime(ticket.createdAt)}</p>
            </div>

            {ticket.dueAt && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Due</p>
                <p className="text-xs text-zinc-600">{formatDateTime(ticket.dueAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
