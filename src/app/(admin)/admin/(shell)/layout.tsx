"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LayoutDashboard, Users, Building2, ToggleLeft, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/orgs", label: "Organizations", icon: Building2, exact: false },
  { href: "/admin/features", label: "Feature Flags", icon: ToggleLeft, exact: false },
];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col border-r border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800">
          <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">SF</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">ServiceFlow</p>
            <p className="text-xs text-zinc-500">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && pathname !== "/admin";
            const isOverview = href === "/admin";
            const overviewActive = isOverview && pathname === "/admin";
            const isActive = isOverview ? overviewActive : active;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden bg-zinc-50">
        <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
          <div />
          <span className="text-xs text-zinc-400 font-mono">{session?.user.email}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
