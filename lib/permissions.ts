export const ROLE = {
  MOSQUE_ADMIN: "mosque_admin",
  CONTENT: "content",
  TIMINGS: "timings",
  DONATIONS: "donations",
} as const;

export type RoleKey = (typeof ROLE)[keyof typeof ROLE];

type RoleContext = {
  role?: string | null;
  isOwner?: boolean;
  isAdmin?: boolean;
};

const ROLE_PREFIXES: Record<RoleKey, string[]> = {
  [ROLE.MOSQUE_ADMIN]: ["/dashboard"],
  [ROLE.CONTENT]: [
    "/dashboard",
    "/dashboard/events",
    "/dashboard/analytics",
    "/dashboard/signage",
    "/dashboard/tv-displays",
    "/dashboard/content-library",
  ],
  [ROLE.TIMINGS]: ["/dashboard", "/dashboard/prayer-times"],
  [ROLE.DONATIONS]: ["/dashboard", "/dashboard/donations"],
};

export const getEffectiveRole = ({ role, isOwner, isAdmin }: RoleContext) => {
  if (isOwner || isAdmin || role === ROLE.MOSQUE_ADMIN) {
    return ROLE.MOSQUE_ADMIN;
  }
  if (role === ROLE.CONTENT || role === ROLE.TIMINGS || role === ROLE.DONATIONS) {
    return role;
  }
  return ROLE.TIMINGS;
};

export const canAccessPath = (
  pathname: string,
  ctx: RoleContext
): boolean => {
  const effectiveRole = getEffectiveRole(ctx);
  const prefixes = ROLE_PREFIXES[effectiveRole];
  return prefixes.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
};

export const canAccessGroup = (
  group: "main" | "donations" | "content" | "management",
  ctx: RoleContext
): boolean => {
  const effectiveRole = getEffectiveRole(ctx);
  if (effectiveRole === ROLE.MOSQUE_ADMIN) return true;
  if (group === "main") return true;
  if (group === "content") return effectiveRole === ROLE.CONTENT;
  if (group === "donations") return effectiveRole === ROLE.DONATIONS;
  if (group === "management") return false;
  return false;
};
