"use server";
import { prisma } from "@/lib/db";

export const getAllAnnouncements = async (masjidId?: string) => {
  return prisma.announcement.findMany({
    where: masjidId ? { masjidId } : undefined,
    include: { displays: true, contentItem: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAnnouncementById = async (id: string) => {
  return prisma.announcement.findUnique({
    where: { id },
    include: { displays: true, contentItem: true },
  });
};

export const createAnnouncement = async (data: any) => {
  return prisma.announcement.create({ data });
};

export const updateAnnouncement = async (id: string, data: any) => {
  const masjidId = data.masjidId;
  const content = data.data.content;
  delete data.data;
  delete data.masjidId;
  return prisma.announcement.update({ where: { id }, data: {
    ...data,
    content,    
    masjid: {
      connect: {
        id: masjidId
      }
    }
  } });
};

export const deleteAnnouncement = async (id: string) => {
  return prisma.announcement.delete({ where: { id } });
}; 