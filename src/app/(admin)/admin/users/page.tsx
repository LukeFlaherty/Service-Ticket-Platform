import type { Metadata } from "next";
import { db } from "@/db";
import { user, member, organization } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const allUsers = await db.select().from(user).orderBy(user.createdAt);

  const memberships = await db
    .select({
      userId: member.userId,
      role: member.role,
      orgName: organization.name,
      orgSlug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id));

  const memberMap = new Map<string, typeof memberships>();
  for (const m of memberships) {
    if (!memberMap.has(m.userId)) memberMap.set(m.userId, []);
    memberMap.get(m.userId)!.push(m);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <span className="text-sm text-zinc-500">{allUsers.length} total</span>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Organizations</th>
              <th className="px-4 py-3 text-left font-medium">Verified</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {allUsers.map((u) => {
              const orgs = memberMap.get(u.id) ?? [];
              return (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {orgs.length === 0 ? (
                      <span className="text-zinc-400 text-xs">No org</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {orgs.map((m) => (
                          <span
                            key={m.orgSlug}
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium"
                          >
                            {m.orgName}
                            <span className="text-zinc-400 capitalize">({m.role})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.emailVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {u.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(u.createdAt)}</td>
                </tr>
              );
            })}
            {allUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
