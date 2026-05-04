import type { Metadata } from "next";
import { db } from "@/db";
import { orgs } from "@/db/schema";
import { count } from "drizzle-orm";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const [{ total }] = await db.select({ total: count() }).from(orgs);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total Organizations</p>
          <p className="mt-1 text-3xl font-bold">{total}</p>
        </div>
      </div>
    </div>
  );
}
