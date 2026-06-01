"use server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "./masjid";
import { publishRealtimeUpdate } from "@/lib/realtime/publish";

async function requireMasjidAccess(masjidId?: string) {
  if (!masjidId) return null;
  const masjid = await getUserMasjid(masjidId);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    return null;
  }
  return masjid;
}

export const getAllAnnouncements = async (masjidId?: string) => {
  const access = await requireMasjidAccess(masjidId);
  if (!access) return null;
  return prisma.announcement.findMany({
    where: { masjidId: access.id },
    include: { displays: true, contentItem: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAnnouncementById = async (id: string) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { displays: true, contentItem: true },
  });
  if (!announcement) return null;
  const access = await requireMasjidAccess(announcement.masjidId);
  if (!access) return null;
  return announcement;
};

export const createAnnouncement = async (data: any) => {
  const access = await requireMasjidAccess(data?.masjidId);
  if (!access) return null;
  const created = await prisma.announcement.create({ data });
  await publishRealtimeUpdate({
    masjidId: created.masjidId,
    type: "content_update",
    reason: "announcement_created",
  });
  return created;
};

export const updateAnnouncement = async (id: string, data: any) => {
  const existing = await prisma.announcement.findUnique({
    where: { id },
    select: { masjidId: true },
  });
  if (!existing) return null;
  const access = await requireMasjidAccess(existing.masjidId);
  if (!access) return null;

  const masjidId = data?.masjidId;
  const content = data?.data?.content;
  if (data?.data) delete data.data;
  if (data?.masjidId) delete data.masjidId;

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...data,
      ...(content !== undefined ? { content } : {}),
      ...(masjidId
        ? {
            masjid: {
              connect: {
                id: masjidId,
              },
            },
          }
        : {}),
    },
  });
  await publishRealtimeUpdate({
    masjidId: existing.masjidId,
    type: "content_update",
    reason: "announcement_updated",
  });
  return updated;
};

export const deleteAnnouncement = async (id: string) => {
  const existing = await prisma.announcement.findUnique({
    where: { id },
    select: { masjidId: true },
  });
  if (!existing) return null;
  const access = await requireMasjidAccess(existing.masjidId);
  if (!access) return null;
  const deleted = await prisma.announcement.delete({ where: { id } });
  await publishRealtimeUpdate({
    masjidId: existing.masjidId,
    type: "content_update",
    reason: "announcement_deleted",
  });
  return deleted;
};
