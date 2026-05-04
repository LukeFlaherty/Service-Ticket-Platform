import { requireOrg } from "@/lib/auth";
import { getOrgFeatures } from "@/lib/features";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { org, userId } = await requireOrg();
  const features = await getOrgFeatures(org.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav org={org} enabledFeatures={features} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar org={org} userId={userId} />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
