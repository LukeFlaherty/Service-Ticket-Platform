import type { Metadata } from "next";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { features, orgFeatures, orgs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Feature Flags" };

export default async function FeaturesPage() {
  const allFeatures = await db.select().from(features).orderBy(features.category);
  const allOrgs = await db.select({ id: orgs.id, name: orgs.name }).from(orgs);
  const allOrgFeatures = await db.select().from(orgFeatures);

  const enabledMap = new Map<string, Set<string>>();
  for (const of_ of allOrgFeatures) {
    if (!enabledMap.has(of_.orgId)) enabledMap.set(of_.orgId, new Set());
    if (of_.enabled) enabledMap.get(of_.orgId)!.add(of_.featureId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Feature Flags</h1>
      <p className="text-sm text-zinc-500">
        Toggle features per organization. Changes take effect immediately.
      </p>
      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Feature</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              {allOrgs.map((org) => (
                <th key={org.id} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                  {org.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {allFeatures.map((feature) => (
              <tr key={feature.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{feature.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize">
                    {feature.category}
                  </span>
                </td>
                {allOrgs.map((org) => {
                  const enabled = enabledMap.get(org.id)?.has(feature.id) ?? false;
                  return (
                    <td key={org.id} className="px-4 py-3">
                      {/* Toggle will be a client component with server action */}
                      <span
                        className={`inline-block h-4 w-4 rounded-full ${
                          enabled ? "bg-green-500" : "bg-zinc-200"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
