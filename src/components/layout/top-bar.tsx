"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import type { Org } from "@/db/schema";

interface TopBarProps {
  org: Org;
}

export function TopBar({ org }: TopBarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6 shrink-0">
      <span className="text-sm text-zinc-500 font-medium">{org.name}</span>

      <div className="flex items-center gap-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <div className="h-7 w-7 rounded-full bg-zinc-900 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
