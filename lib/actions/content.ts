import { prisma } from "@/lib/db";

export const getAllContent = async (masjidId?: string) => {
  return prisma.content.findMany({
    where: masjidId ? { masjidId } : undefined,
    include: { displays: true, assignedToDisplays: true, announcements: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getContentById = async (id: string) => {
  return prisma.content.findUnique({
    where: { id },
    include: { displays: true, assignedToDisplays: true, announcements: true },
  });
};

export const createContent = async (data: any) => {
  return prisma.content.create({ data });
};

export const updateContent = async (id: string, data: any) => {
  return prisma.content.update({ where: { id }, data });
};

export const deleteContent = async (id: string) => {
  return prisma.content.delete({ where: { id } });
};

// New function for rich content creation with all configuration
export const createContentWithConfig = async (data: {
  masjidId: string;
  title: string;
  type: string;
  description?: string;
  url?: string;
  data?: any;
  displayLocations?: string[];
  fullscreen?: boolean;
  zones?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  dayType?: string;
  active?: boolean;
}) => {
  return prisma.content.create({
    data: {
      masjidId: data.masjidId,
      title: data.title,
      type: data.type,
      description: data.description,
      url: data.url,
      data: data.data,
      zones: data.zones,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      active: data.active ?? true,
      // You can store config as JSON if needed
      // config: { displayLocations: data.displayLocations, fullscreen: data.fullscreen, ... }
    },
  });
}; 