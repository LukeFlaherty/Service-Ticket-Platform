import type { Metadata } from "next";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { orgs } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Organizations" };

export default async function OrgsPage() {
  const allOrgs = await db.select().from(orgs).orderBy(orgs.createdAt);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3 text-zinc-500">{org.slug}</td>
                <td className="px-4 py-3 capitalize">{org.plan}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      org.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {org.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(org.createdAt)}</td>
              </tr>
            ))}
            {allOrgs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
