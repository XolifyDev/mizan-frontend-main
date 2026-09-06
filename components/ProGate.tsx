import { headers } from "next/headers";

import { getMasjidPlan } from "@/lib/plan-guard";
import { isPathLocked } from "@/lib/plan";
import { ProUpgrade } from "@/components/ProUpgrade";

/**
 * Server-side plan gate. Wrap a Pro section's `layout.tsx` in this.
 *
 * Reads the active masjid and pathname from headers set by `middleware.ts`,
 * because Next.js layouts don't receive searchParams and most dashboard pages
 * are client components (so they can't await a plan lookup themselves).
 *
 * This runs on the server, so the page's data and markup are never sent to a
 * Free masjid — unlike the sidebar's greying-out, which is only cosmetic.
 */
export async function ProGate({
  children,
  feature,
}: {
  children: React.ReactNode;
  feature?: string;
}) {
  const h = await headers();
  const masjidId = h.get("x-masjid-id");
  const pathname = h.get("x-pathname") ?? "";

  const plan = await getMasjidPlan(masjidId);

  if (isPathLocked(pathname, plan)) {
    return <ProUpgrade feature={feature} masjidId={masjidId} />;
  }

  return <>{children}</>;
}
