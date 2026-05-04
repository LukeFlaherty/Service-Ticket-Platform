import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/session";
import { getOrgFeatures } from "@/lib/features";
import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";

export const dynamic = "force-dynamic";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  let orgData;
  try {
    orgData = await requireOrg();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    redirect(msg === "NO_ORG" ? "/onboarding" : "/sign-in");
  }

  const { org } = orgData!;
  const features = await getOrgFeatures(org.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav org={org} enabledFeatures={features} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar org={org} />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50">{children}</main>
      </div>
    </div>
  );
}
