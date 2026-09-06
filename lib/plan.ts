/**
 * Plan gating — single source of truth for which parts of the dashboard
 * require a Pro subscription.
 *
 * The plan lives on the Masjid, not the User: TV devices pair to a masjid, and
 * a user can belong to several masjids on different plans.
 *
 * IMPORTANT: this module is shared by the sidebar (which greys items out) and
 * the server-side guard (which actually blocks). The UI is a courtesy — never
 * the security boundary. Any route added here must also be enforced server-side
 * via `assertPro`, because a determined user can just type the URL.
 */

export type Plan = "FREE" | "PRO";

/**
 * Master switch for plan gating.
 *
 * OFF by default and until billing is actually live. With it off, every masjid
 * behaves as Pro: nothing is stripped from a device payload, no route is
 * locked, no template is disabled. Turning gating on before subscriptions
 * exist would downgrade displays that are working today.
 *
 * Set NEXT_PUBLIC_PLAN_ENFORCEMENT="true" to enable.
 */
export const isPlanEnforced = (): boolean =>
  process.env.NEXT_PUBLIC_PLAN_ENFORCEMENT === "true";

/** Routes that require Pro. Longest-prefix match, so children are covered. */
export const PRO_PATHS = [
  "/dashboard/analytics",
  "/dashboard/content-library",
  "/dashboard/events",
  "/dashboard/donations",
  "/dashboard/kiosk",
  "/dashboard/payment-kiosks",
  "/dashboard/products",
  "/dashboard/orders",
  "/dashboard/users",
] as const;

/**
 * Routes that must stay reachable on Free no matter what — a masjid that can't
 * open Billing can't upgrade, and locking Settings would strand them.
 */
const ALWAYS_FREE = [
  "/dashboard/billing",
  "/dashboard/settings",
] as const;

export const isProPath = (pathname: string): boolean => {
  if (ALWAYS_FREE.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return false;
  }
  return PRO_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
};

/** Everything is Pro while gating is switched off. */
export const isPro = (plan?: Plan | string | null): boolean =>
  !isPlanEnforced() || plan === "PRO";

/** True when this masjid should be blocked from this route. */
export const isPathLocked = (
  pathname: string,
  plan?: Plan | string | null
): boolean => isProPath(pathname) && !isPro(plan);

/**
 * Feature flags for things gated *inside* an allowed page rather than by route
 * — signage templates, split-screen layouts, seat count, and so on.
 */
export const PRO_FEATURES = {
  templates: ["geometric", "mihrab"] as string[],
  layouts: ["l-shape", "reverse-l-shape"] as string[],
  realtimePush: true,
  removeBranding: true,
  auditLog: true,
} as const;

/** Free masjids get a single slide in the rotation. */
export const FREE_SLIDE_LIMIT = 1;

/** Slides a masjid may display. Infinity on Pro. */
export const slideLimit = (plan?: Plan | string | null): number =>
  isPro(plan) ? Infinity : FREE_SLIDE_LIMIT;

/** Free masjids get a single seat: the owner. */
export const FREE_SEAT_LIMIT = 1;
export const PRO_SEAT_LIMIT = 10;

export const seatLimit = (plan?: Plan | string | null): number =>
  isPro(plan) ? PRO_SEAT_LIMIT : FREE_SEAT_LIMIT;

export const canUseTemplate = (
  template: string | null | undefined,
  plan?: Plan | string | null
): boolean =>
  !template ||
  !PRO_FEATURES.templates.includes(template) ||
  isPro(plan);

export const canUseLayout = (
  layout: string | null | undefined,
  plan?: Plan | string | null
): boolean =>
  !layout ||
  !PRO_FEATURES.layouts.includes(layout) ||
  isPro(plan);
