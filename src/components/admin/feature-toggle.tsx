"use client";

import { useTransition, useState } from "react";
import { toggleOrgFeature } from "@/server/actions/admin-features";

export function FeatureToggle({
  orgId,
  featureId,
  enabled: initialEnabled,
}: {
  orgId: string;
  featureId: string;
  enabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      try {
        await toggleOrgFeature({ orgId, featureId, enabled: next });
      } catch {
        setEnabled(!next);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={enabled ? "Disable" : "Enable"}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        enabled ? "bg-green-500" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
