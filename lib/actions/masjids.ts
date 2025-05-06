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