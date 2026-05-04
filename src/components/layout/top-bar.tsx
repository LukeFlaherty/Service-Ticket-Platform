import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import type { Org } from "@/db/schema";

interface TopBarProps {
  org: Org;
  userId: string;
}

export function TopBar({ org }: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6 shrink-0">
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl="/dashboard"
        appearance={{ elements: { organizationSwitcherTrigger: "text-sm" } }}
      />
      <UserButton />
    </header>
  );
}
