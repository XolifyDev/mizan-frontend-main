"use server";

import { prisma } from "@/lib/db";
import { ContentType } from "@prisma/client";

export const getAllContent = async (masjidId?: string) => {
  return prisma.content.findMany({
    where: masjidId ? { masjidId } : undefined,
    include: { displays: true, assignedToDisplays: true, announcements: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllAnnouncements = async (masjidId: string) => {
  return prisma.announcement.findMany({
    where: masjidId ? { masjidId } : undefined,
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

export const createAnnouncement = async (data: {
  masjidId: string;
  title: string;
  type: string;
  content?: string;
  data?: any;
  displayLocations?: string[];
  fullscreen?: boolean;
  zones?: string[];
  startDate?: string;
  endDate?: string;
  active?: boolean;
}) => {
  return prisma.announcement.create({
    data: {
      masjidId: data.masjidId,
      title: data.title,
      content: data.content,
      type: data.type as ContentType,
      data: data.data,
      zones: data.zones?.join(","),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      active: data.active ?? true, 
      displayLocations: data.displayLocations,
      fullscreen: data.fullscreen,
    },
  });
};


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
  timeType?: string;
}) => {
  return prisma.content.create({
    data: {
      masjidId: data.masjidId,
      title: data.title,
      type: data.type as ContentType,
      description: data.description,
      url: data.url,
      data: data.data,
      zones: typeof data.zones === "string" ? data.zones : data.zones?.join(","),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      active: data.active ?? true,
      displayLocations: data.displayLocations,
      fullscreen: data.fullscreen,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      startTime: data.startTime,
      endTime: data.endTime, 
      duration: data.duration,
      dayType: data.dayType,
      timeType: data.timeType,
    },
  });
}; 