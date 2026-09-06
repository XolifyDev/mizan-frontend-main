/**
 * Per-masjid roles.
 *
 * Distinct from `lib/permissions.ts`, which keys off the legacy global
 * `User.role` string. That field can't express "content editor at masjid A,
 * finance at masjid B" — this one is scoped to a `MasjidMember` row.
 */

export const MASJID_ROLE = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  CONTENT_EDITOR: "CONTENT_EDITOR",
  PRAYER_TIMES: "PRAYER_TIMES",
  FINANCE: "FINANCE",
  VIEWER: "VIEWER",
} as const;

export type MasjidRoleKey = (typeof MASJID_ROLE)[keyof typeof MASJID_ROLE];

export const ROLE_LABELS: Record<MasjidRoleKey, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  CONTENT_EDITOR: "Content Editor",
  PRAYER_TIMES: "Prayer Times Manager",
  FINANCE: "Finance",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<MasjidRoleKey, string> = {
  OWNER: "Full access, including billing and ownership transfer",
  ADMIN: "Everything except billing",
  CONTENT_EDITOR: "Announcements, slides and content library",
  PRAYER_TIMES: "Prayer and iqamah times only",
  FINANCE: "Donations, kiosk, orders and payouts",
  VIEWER: "Read-only access to analytics",
};

/** Roles that can be handed out via invite — Owner is transferred, not granted. */
export const ASSIGNABLE_ROLES: MasjidRoleKey[] = [
  MASJID_ROLE.ADMIN,
  MASJID_ROLE.CONTENT_EDITOR,
  MASJID_ROLE.PRAYER_TIMES,
  MASJID_ROLE.FINANCE,
  MASJID_ROLE.VIEWER,
];

/** Dashboard prefixes each role may reach. Longest-prefix match. */
const ROLE_PATHS: Record<MasjidRoleKey, string[]> = {
  OWNER: ["/dashboard"],
  ADMIN: ["/dashboard"],
  CONTENT_EDITOR: [
    "/dashboard",
    "/dashboard/signage",
    "/dashboard/tv-displays",
    "/dashboard/content-library",
    "/dashboard/announcements",
    "/dashboard/events",
  ],
  PRAYER_TIMES: ["/dashboard", "/dashboard/prayer-times"],
  FINANCE: [
    "/dashboard",
    "/dashboard/donations",
    "/dashboard/kiosk",
    "/dashboard/payment-kiosks",
    "/dashboard/orders",
    "/dashboard/products",
  ],
  VIEWER: ["/dashboard", "/dashboard/analytics"],
};

/** Only these roles may reach Billing, on top of the path table above. */
const BILLING_ROLES: MasjidRoleKey[] = [MASJID_ROLE.OWNER];

export const roleCanAccess = (
  pathname: string,
  role: MasjidRoleKey | string | null | undefined
): boolean => {
  const key = (role ?? MASJID_ROLE.VIEWER) as MasjidRoleKey;
  const prefixes = ROLE_PATHS[key] ?? ROLE_PATHS.VIEWER;

  if (
    pathname === "/dashboard/billing" ||
    pathname.startsWith("/dashboard/billing/")
  ) {
    return BILLING_ROLES.includes(key);
  }

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
};

export const isMasjidAdmin = (
  role: MasjidRoleKey | string | null | undefined
): boolean => role === MASJID_ROLE.OWNER || role === MASJID_ROLE.ADMIN;
