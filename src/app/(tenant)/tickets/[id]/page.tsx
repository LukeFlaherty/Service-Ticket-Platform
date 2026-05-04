import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/session";
import { getTicket, getComments } from "@/server/queries/tickets";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, MapPin, Wrench, Clock, Home, KeyRound } from "lucide-react";
import { TicketSidebar } from "@/components/tickets/ticket-sidebar";
import { CommentThread } from "@/components/tickets/comment-thread";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Ticket ${id.slice(0, 8)}` };
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-zinc-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-zinc-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let orgData;
  try {
    orgData = await requireOrg();
  } catch {
    redirect("/sign-in");
  }

  const { org, user } = orgData!;
  const ticket = await getTicket(org.id, id);
  if (!ticket) notFound();

  const comments = await getComments(org.id, id);
  const cf = (ticket.customFields ?? {}) as Record<string, string>;

  const serviceAddress = cf.serviceAddress as string | undefined;
  const serviceType = cf.serviceType as string | undefined;
  const propertyType = cf.propertyType as string | undefined;
  const accessInstructions = cf.accessInstructions as string | undefined;
  const urgency = cf.urgency as string | undefined;
  const preferredWindow = cf.preferredWindow as string | undefined;

  const hasCustomFields = serviceAddress || serviceType || propertyType || accessInstructions || preferredWindow;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/tickets" className="mt-1 text-zinc-400 hover:text-zinc-900 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400 font-mono">#{ticket.number}</span>
            {serviceType && (
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium">
                {serviceType}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold mt-0.5">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-5">

          {/* Home services detail card */}
          {hasCustomFields && (
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-zinc-700">Job Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {serviceAddress && (
                  <InfoRow icon={MapPin} label="Service Address" value={serviceAddress} />
                )}
                {propertyType && (
                  <InfoRow icon={Home} label="Property Type" value={propertyType} />
                )}
                {serviceType && (
                  <InfoRow icon={Wrench} label="Service Type" value={serviceType} />
                )}
                {(urgency || preferredWindow) && (
                  <InfoRow
                    icon={Clock}
                    label="Scheduling"
                    value={[urgency, preferredWindow].filter(Boolean).join(" · ")}
                  />
                )}
                {accessInstructions && (
                  <div className="col-span-2">
                    <InfoRow icon={KeyRound} label="Access Instructions" value={accessInstructions} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer contact */}
          {(ticket.customerName || ticket.customerEmail || ticket.customerPhone) && (
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
              <h2 className="text-sm font-semibold text-zinc-700">Customer</h2>
              {ticket.customerName && <p className="text-sm font-medium">{ticket.customerName}</p>}
              <div className="flex flex-wrap gap-4">
                {ticket.customerPhone && (
                  <a href={`tel:${ticket.customerPhone}`} className="text-sm text-indigo-600 hover:underline">
                    {ticket.customerPhone}
                  </a>
                )}
                {ticket.customerEmail && (
                  <a href={`mailto:${ticket.customerEmail}`} className="text-sm text-indigo-600 hover:underline">
                    {ticket.customerEmail}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Problem description */}
          {ticket.description && (
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
              <h2 className="text-sm font-semibold text-zinc-700">Problem Description</h2>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          <CommentThread
            ticketId={ticket.id}
            comments={comments}
            currentUserName={user.name}
          />
        </div>

        {/* Sidebar */}
        <div>
          <TicketSidebar
            ticketId={ticket.id}
            status={ticket.status}
            priority={ticket.priority}
            customerName={ticket.customerName}
            customerEmail={ticket.customerEmail}
            customerPhone={ticket.customerPhone}
            createdAt={ticket.createdAt}
            dueAt={ticket.dueAt}
          />
          {ticket.dueAt && (
            <p className="mt-3 text-center text-xs text-zinc-400">
              Preferred: {formatDateTime(ticket.dueAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
