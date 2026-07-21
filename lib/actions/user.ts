"use server";
import { cache } from "react";
import { auth } from "../auth";
import { prisma } from "../db";
import { headers } from "next/headers";

// cache() deduplicates calls within a single RSC render tree — one DB hit per request
export const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) return null;
  // session.user already has admin, role, masjids (via customSession) and stripeCustomerId (via stripe plugin)
  // Only hit DB again if we need stripeCustomerId which isn't guaranteed in session
  return session.user as typeof session.user & { stripeCustomerId?: string | null };
});

// Use this when you need fields not in the session (e.g. payment-specific queries)
export const getFullUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      admin: true,
      role: true,
      stripeCustomerId: true,
      masjids: { select: { id: true, name: true, city: true, country: true } },
    },
  });
});

export const getUsersByMasjid = async (masjidId: string, userId: string) => {
  const users = await prisma.user.findMany({
    where: {
      masjids: { some: { id: masjidId } },
      id: { not: userId },
    },
    include: {
      masjids: true,
      masjidInvites: true,
    },
  });
  return users;
};

export const filterSearchUsers = async (value: string, masjidId: string, session: { user: { id: string } }) => {
  const results = await prisma.user.findMany({
    where: {
      email: { contains: value.toLowerCase() },
      NOT: { id: session?.user.id },
      masjids: { none: { id: masjidId } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    take: 5,
  });
  return results;
};
