import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { db } from "@/db";
import { member, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team" };

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700",
  admin: "bg-blue-100 text-blue-700",
  member: "bg-zinc-100 text-zinc-600",
};

export default async function TeamPage() {
  let orgData;
  try {
    orgData = await requireOrg();
  } catch {
    redirect("/sign-in");
  }

  const { org } = orgData!;

  const members = await db
    .select({
      id: member.id,
      role: member.role,
      joinedAt: member.createdAt,
      name: user.name,
      email: user.email,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, org.id))
    .orderBy(member.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-zinc-500">{members.length} member{members.length !== 1 ? "s" : ""} in {org.name}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Member</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium text-zinc-600 shrink-0">
                      {m.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-zinc-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[m.role] ?? ROLE_STYLES.member}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(m.joinedAt)}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-zinc-400">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
