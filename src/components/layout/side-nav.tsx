"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  Settings,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_IDS, type FeatureId } from "@/db/schema";
import type { Org } from "@/db/schema";

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/team", label: "Team", icon: Users },
];

const featureLinks: {
  href: string;
  label: string;
  icon: React.ElementType;
  featureId: FeatureId;
}[] = [
  { href: "/vendors", label: "Vendors", icon: Building2, featureId: FEATURE_IDS.VENDOR_MANAGEMENT },
  { href: "/integrations", label: "Integrations", icon: Plug, featureId: FEATURE_IDS.GHL_INTEGRATION },
];

interface SideNavProps {
  org: Org;
  enabledFeatures: Set<FeatureId>;
}

export function SideNav({ org, enabledFeatures }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-white shrink-0">
      <div className="flex items-center gap-2.5 p-4 border-b">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: org.primaryColor ?? "#18181b" }}
        >
          {org.name[0].toUpperCase()}
        </div>
        <span className="text-sm font-semibold truncate">{org.name}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 text-sm">
        {baseLinks.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={Icon} active={pathname.startsWith(href)} />
        ))}

        {featureLinks
          .filter(({ featureId }) => enabledFeatures.has(featureId))
          .map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} icon={Icon} active={pathname.startsWith(href)} />
          ))}
      </nav>

      <div className="p-3 border-t">
        <NavLink
          href="/settings"
          label="Settings"
          icon={Settings}
          active={pathname.startsWith("/settings")}
        />
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
