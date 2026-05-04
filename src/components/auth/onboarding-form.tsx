"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.organization.create({ name, slug });

    if (error) {
      setError(error.message ?? "Failed to create organization.");
      setLoading(false);
      return;
    }

    // Set it as the active org
    await authClient.organization.setActive({ organizationSlug: slug });

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set up your workspace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create your organization to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="org-name">Organization name</Label>
          <Input
            id="org-name"
            type="text"
            placeholder="Acme Corp"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org-slug">URL slug</Label>
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-zinc-900 focus-within:ring-offset-1">
            <span className="px-3 text-sm text-zinc-400 select-none">serviceflow.com/</span>
            <input
              id="org-slug"
              type="text"
              className="flex-1 bg-transparent py-1.5 pr-3 text-sm outline-none"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !name || !slug}>
          {loading ? "Creating…" : "Create workspace"}
        </Button>
      </form>
    </div>
  );
}
