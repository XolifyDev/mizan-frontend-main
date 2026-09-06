import "server-only";

import { prisma } from "@/lib/db";
import { isPathLocked, isPlanEnforced, isPro, type Plan } from "@/lib/plan";

/**
 * Server-side plan enforcement.
 *
 * The sidebar greys out Pro routes, but that is cosmetic — anyone can type the
 * URL, and the dashboard ships to the browser. These helpers are the real gate
 * and must be called from any Pro page's server component / action.
 */

export const getMasjidPlan = async (
  masjidId: string | null | undefined
): Promise<Plan> => {
  // Gating disabled: never touch the plan columns, so this works whether or not
  // the migration has been applied.
  if (!isPlanEnforced()) return "PRO";
  if (!masjidId) return "FREE";

  try {
    const masjid = await prisma.masjid.findUnique({
      where: { id: masjidId },
      select: { plan: true, planStatus: true, planCurrentPeriodEnd: true },
    });
    if (!masjid) return "FREE";

    // A subscription that lapsed but hasn't been reconciled by the webhook yet
    // should not keep unlocking Pro.
    if (
      masjid.planCurrentPeriodEnd &&
      masjid.planCurrentPeriodEnd.getTime() < Date.now()
    ) {
      return "FREE";
    }
    return masjid.plan as Plan;
  } catch (e) {
    // Most likely the migration hasn't run yet. Fail OPEN rather than blanking
    // every masjid's displays over a schema mismatch.
    console.error("[plan] could not read plan, defaulting to PRO", e);
    return "PRO";
  }
};

export const masjidIsPro = async (
  masjidId: string | null | undefined
): Promise<boolean> => isPro(await getMasjidPlan(masjidId));

/**
 * Throws unless the masjid may access `pathname`. Call at the top of a Pro
 * page's server component.
 */
export const assertPro = async (
  pathname: string,
  masjidId: string | null | undefined
): Promise<void> => {
  const plan = await getMasjidPlan(masjidId);
  if (isPathLocked(pathname, plan)) {
    throw new ProRequiredError(pathname);
  }
};

export class ProRequiredError extends Error {
  constructor(public readonly pathname: string) {
    super(`Pro plan required for ${pathname}`);
    this.name = "ProRequiredError";
  }
}
