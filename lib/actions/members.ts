"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getUser } from "@/lib/actions/user";
import { seatLimit } from "@/lib/plan";
import {
  ASSIGNABLE_ROLES,
  MASJID_ROLE,
  isMasjidAdmin,
  type MasjidRoleKey,
} from "@/lib/masjid-roles";

/**
 * Resolves a user's role at a masjid.
 *
 * Falls back to the legacy implicit `MasjidUsers` relation for members who
 * predate `MasjidMember`, treating them as ADMIN — that's what they had before
 * roles existed, so this can't silently take access away.
 */
export async function getMasjidRole(
  masjidId: string,
  userId?: string
): Promise<MasjidRoleKey | null> {
  let uid = userId;
  if (!uid) {
    const user = await getUser();
    if (!user) return null;
    uid = user.id;
  }

  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: { ownerId: true },
  });
  if (!masjid) return null;
  if (masjid.ownerId === uid) return MASJID_ROLE.OWNER;

  const membership = await prisma.masjidMember.findUnique({
    where: { masjidId_userId: { masjidId, userId: uid } },
    select: { role: true },
  });
  if (membership) return membership.role as MasjidRoleKey;

  const legacy = await prisma.masjid.findFirst({
    where: { id: masjidId, users: { some: { id: uid } } },
    select: { id: true },
  });
  return legacy ? MASJID_ROLE.ADMIN : null;
}

/** Counts seats in use: owner + members + outstanding invites. */
export async function getSeatUsage(masjidId: string) {
  const [masjid, memberCount, pendingInvites] = await Promise.all([
    prisma.masjid.findUnique({
      where: { id: masjidId },
      select: { plan: true },
    }),
    prisma.masjidMember.count({ where: { masjidId } }),
    prisma.masjidInvite.count({ where: { masjidId, status: "pending" } }),
  ]);

  const limit = seatLimit(masjid?.plan);
  // +1 for the owner, who has no MasjidMember row.
  const used = memberCount + pendingInvites + 1;
  return { used, limit: limit + 1, hasRoom: used < limit + 1 };
}

export async function setMemberRole(
  masjidId: string,
  targetUserId: string,
  role: MasjidRoleKey
) {
  const actor = await getUser();
  if (!actor) return { error: true, message: "Not signed in" };

  const actorRole = await getMasjidRole(masjidId, actor.id);
  if (!isMasjidAdmin(actorRole)) {
    return { error: true, message: "You can't change roles at this masjid" };
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { error: true, message: "That role can't be assigned" };
  }

  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: { ownerId: true },
  });
  if (masjid?.ownerId === targetUserId) {
    return { error: true, message: "The owner's role can't be changed" };
  }

  await prisma.masjidMember.upsert({
    where: { masjidId_userId: { masjidId, userId: targetUserId } },
    create: { masjidId, userId: targetUserId, role },
    update: { role },
  });

  revalidatePath("/dashboard/users");
  return { error: false, message: "Role updated" };
}

export async function removeMember(masjidId: string, targetUserId: string) {
  const actor = await getUser();
  if (!actor) return { error: true, message: "Not signed in" };

  const actorRole = await getMasjidRole(masjidId, actor.id);
  if (!isMasjidAdmin(actorRole)) {
    return { error: true, message: "You can't remove members at this masjid" };
  }

  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: { ownerId: true },
  });
  if (masjid?.ownerId === targetUserId) {
    return { error: true, message: "The owner can't be removed" };
  }

  await prisma.$transaction([
    prisma.masjidMember.deleteMany({ where: { masjidId, userId: targetUserId } }),
    // Also detach the legacy relation so access is fully revoked.
    prisma.masjid.update({
      where: { id: masjidId },
      data: { users: { disconnect: { id: targetUserId } } },
    }),
  ]);

  revalidatePath("/dashboard/users");
  return { error: false, message: "Member removed" };
}

/** Lists members with their roles, including the owner. */
export async function listMembers(masjidId: string) {
  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: {
      ownerId: true,
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: {
        select: {
          role: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });
  if (!masjid) return [];

  const rows = [
    {
      ...masjid.owner,
      role: MASJID_ROLE.OWNER as MasjidRoleKey,
      joinedAt: null as Date | null,
    },
    ...masjid.members.map((m) => ({
      ...m.user,
      role: m.role as MasjidRoleKey,
      joinedAt: m.createdAt,
    })),
  ];

  // Legacy members without a MasjidMember row still need to appear.
  const seen = new Set(rows.map((r) => r.id));
  for (const u of masjid.users) {
    if (!seen.has(u.id)) {
      rows.push({ ...u, role: MASJID_ROLE.ADMIN as MasjidRoleKey, joinedAt: null });
    }
  }

  return rows;
}
