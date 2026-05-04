import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-zinc-500">Manage all service tickets.</p>
        </div>
        {/* New Ticket button will go here */}
      </div>
      {/* Ticket table will go here */}
    </div>
  );
}
