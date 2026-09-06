"use server";

import { prisma } from "../db";

export const updateMasjid = async (
  id: string,
  data: {
    googleCalendarId?: string;
    googleCalendarCredentials?: any;
  }
) => {
  const masjid = await prisma.masjid.update({
    where: { id },
    data,
  });
  return masjid;
}; 

export const getMasjids = async () => {
  const masjids = await prisma.masjid.findMany();
  return masjids;
};

export const getMasjidById = async (id: string) => {
  const masjid = await prisma.masjid.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
      logo: true,
      timezone: true,
    },
  });
  return masjid;
};

/**
 * Plan for the signage editor's Pro badges. Separate from getMasjidById so that
 * function never touches the plan columns — it runs on paths that must work
 * whether or not the plan migration has been applied.
 */
export const getMasjidPlanForEditor = async (id: string) => {
  const { getMasjidPlan } = await import("@/lib/plan-guard");
  return getMasjidPlan(id);
};
