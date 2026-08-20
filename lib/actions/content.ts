"use server";

import { prisma } from "@/lib/db";
import { ContentType } from "@prisma/client";
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

export const getAllContent = async (masjidId?: string) => {
  const access = await requireMasjidAccess(masjidId);
  if (!access) return null;
  return prisma.content.findMany({
    where: { masjidId: access.id },
    include: { displays: true, assignedToDisplays: true, announcements: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllAnnouncements = async (masjidId: string) => {
  const access = await requireMasjidAccess(masjidId);
  if (!access) return null;
  return prisma.announcement.findMany({
    where: { masjidId: access.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getContentById = async (id: string) => {
  const content = await prisma.content.findUnique({
    where: { id },
    include: { displays: true, assignedToDisplays: true, announcements: true },
  });
  if (!content) return null;
  const access = await requireMasjidAccess(content.masjidId);
  if (!access) return null;
  return content;
};

export const createContent = async (data: any) => {
  const access = await requireMasjidAccess(data?.masjidId);
  if (!access) return null;
  const created = await prisma.content.create({ data });
  await publishRealtimeUpdate({
    masjidId: created.masjidId,
    type: "content_update",
    reason: "content_created",
  });
  return created;
};

export const updateContent = async (id: string, data: any) => {
  const existing = await prisma.content.findUnique({
    where: { id },
    select: { masjidId: true },
  });
  if (!existing) return null;
  const access = await requireMasjidAccess(existing.masjidId);
  if (!access) return null;

  // Strip form-only fields; map status → active
  const { status, file, masjidId: _mid, ...rest } = data;
  const prismaData: Record<string, unknown> = { ...rest };
  if (status !== undefined) {
    prismaData.active = status === "Active";
  }
  // Ensure zones is always stored as a comma-joined string
  if (Array.isArray(prismaData.zones)) {
    prismaData.zones = (prismaData.zones as string[]).join(",");
  }
  // Safely coerce date fields — Prisma requires Date objects or ISO strings with T separator
  for (const field of ["startDate", "endDate"] as const) {
    const val = prismaData[field];
    if (val === null || val === undefined || val === "") {
      prismaData[field] = null;
    } else {
      const d = new Date(String(val).replace(" ", "T"));
      prismaData[field] = isNaN(d.getTime()) ? null : d;
    }
  }

  const updated = await prisma.content.update({ where: { id }, data: prismaData });
  await publishRealtimeUpdate({
    masjidId: existing.masjidId,
    type: "content_update",
    reason: "content_updated",
  });
  return updated;
};

export const deleteContent = async (id: string) => {
  const existing = await prisma.content.findUnique({
    where: { id },
    select: { masjidId: true },
  });
  if (!existing) return null;
  const access = await requireMasjidAccess(existing.masjidId);
  if (!access) return null;
  const deleted = await prisma.content.delete({ where: { id } });
  await publishRealtimeUpdate({
    masjidId: existing.masjidId,
    type: "content_update",
    reason: "content_deleted",
  });
  return deleted;
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
  const access = await requireMasjidAccess(data.masjidId);
  if (!access) return null;
  const created = await prisma.announcement.create({
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
  await publishRealtimeUpdate({
    masjidId: created.masjidId,
    type: "content_update",
    reason: "announcement_created",
  });
  return created;
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
  const access = await requireMasjidAccess(data.masjidId);
  if (!access) return null;
  const created = await prisma.content.create({
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
  await publishRealtimeUpdate({
    masjidId: created.masjidId,
    type: "content_update",
    reason: "content_created",
  });
  return created;
}; 
