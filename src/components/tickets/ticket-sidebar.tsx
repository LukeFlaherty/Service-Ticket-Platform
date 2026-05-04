"use client";

import { useTransition } from "react";
import { updateTicketStatus, updateTicketPriority } from "@/server/actions/tickets";
import { formatDateTime } from "@/lib/utils";

const STATUS_OPTIONS = ["open", "in_progress", "pending", "resolved", "closed"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

type Props = {
  ticketId: string;
  status: string;
  priority: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  createdAt: Date;
  dueAt: Date | null;
};

export function TicketSidebar({
  ticketId,
  status,
  priority,
  customerName,
  customerEmail,
  customerPhone,
  createdAt,
  dueAt,
}: Props) {
  const [statusPending, startStatusTransition] = useTransition();
  const [priorityPending, startPriorityTransition] = useTransition();

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Status</p>
        <select
          defaultValue={status}
          disabled={statusPending}
          onChange={(e) => {
            startStatusTransition(() =>
              updateTicketStatus(ticketId, e.target.value as typeof STATUS_OPTIONS[number])
            );
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Priority</p>
        <select
          defaultValue={priority}
          disabled={priorityPending}
          onChange={(e) => {
            startPriorityTransition(() =>
              updateTicketPriority(ticketId, e.target.value as typeof PRIORITY_OPTIONS[number])
            );
          }}
          className={`w-full rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 ${PRIORITY_STYLES[priority] ?? ""}`}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p} className="bg-white text-zinc-900">
              {p}
            </option>
          ))}
        </select>
      </div>

      {customerName && (
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Customer</p>
          <p className="text-sm font-medium">{customerName}</p>
          {customerEmail && <p className="text-xs text-zinc-500">{customerEmail}</p>}
          {customerPhone && <p className="text-xs text-zinc-500">{customerPhone}</p>}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Created</p>
        <p className="text-xs text-zinc-600">{formatDateTime(createdAt)}</p>
      </div>

      {dueAt && (
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Due</p>
          <p className="text-xs text-zinc-600">{formatDateTime(dueAt)}</p>
        </div>
      )}
    </div>
  );
}
