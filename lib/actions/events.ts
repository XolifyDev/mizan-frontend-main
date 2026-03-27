"use server";

import { prisma } from "../db";
import { syncEventToGoogleCalendar, deleteEventFromGoogleCalendar } from "./google-calendar";
import { getUserMasjid } from "./masjid";

async function requireMasjidAccess(masjidId: string) {
  const masjid = await getUserMasjid(masjidId);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    return null;
  }
  return masjid;
}

export async function createEvent(data: any) {
  if (!data?.masjidId) {
    throw new Error("Missing masjidId");
  }
  const access = await requireMasjidAccess(data.masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  const event = await prisma.event.create({
    data: {
      ...data,
      syncToGoogleCalendar: data.syncToGoogleCalendar || false,
      googleCalendarEventId: null,
      lastSyncedAt: null,
      syncStatus: data.syncToGoogleCalendar ? 'pending' : null,
    },
  });

  if (data.syncToGoogleCalendar) {
    try {
      await syncEventToGoogleCalendar(event.id);
    } catch (error) {
      console.error('Error syncing event to Google Calendar:', error);
      // Update the event's sync status to failed
      await prisma.event.update({
        where: { id: event.id },
        data: {
          syncStatus: 'failed',
        },
      });
    }
  }

  return event;
}

export async function updateEvent(id: string, data: any) {
  // First get the existing event to preserve the googleCalendarEventId
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  }); 
  if (!existingEvent) return null;
  const access = await requireMasjidAccess(existingEvent.masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  const masjid = await prisma.masjid.findUnique({
    where: { id: existingEvent?.masjidId },
    select: { googleCalendarCredentials: true, googleCalendarId: true },
  });

  if(!masjid) return null;

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      syncToGoogleCalendar: typeof data.syncToGoogleCalendar !== 'undefined' || undefined ? data.syncToGoogleCalendar : existingEvent.syncToGoogleCalendar,
      lastSyncedAt: typeof data.lastSyncedAt !== undefined || "undefined" ? data.lastSyncedAt ? existingEvent?.lastSyncedAt : null : existingEvent.lastSyncedAt,
      syncStatus: typeof data.syncStatus !== undefined || "undefined" ? data.syncStatus ? existingEvent?.syncStatus : null : existingEvent.syncStatus,
    },
  });

  if (event.syncToGoogleCalendar) {
    try { 
      await syncEventToGoogleCalendar(event.id, {
        ...data,
        syncToGoogleCalendar: typeof data.syncToGoogleCalendar !== 'undefined' || undefined ? data.syncToGoogleCalendar : existingEvent.syncToGoogleCalendar,
        lastSyncedAt: typeof data.lastSyncedAt !== undefined || "undefined" ? data.lastSyncedAt ? existingEvent?.lastSyncedAt : null : existingEvent.lastSyncedAt,
        syncStatus: typeof data.syncStatus !== undefined || "undefined" ? data.syncStatus ? existingEvent?.syncStatus : null : existingEvent.syncStatus,
      });
    } catch (error) {
      console.error('Error syncing event to Google Calendar:', error);
      // Update the event's sync status to failed
      await prisma.event.update({
        where: { id: event.id },
        data: {
          syncStatus: 'failed',
        },
      });
    }
  }

  return event;
}

export async function deleteEvent(id: string) {
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });
  if (!existingEvent) {
    throw new Error("Event not found");
  }
  const access = await requireMasjidAccess(existingEvent.masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  try {
    await deleteEventFromGoogleCalendar(id);
  } catch (error) {
    console.error('Error deleting event from Google Calendar:', error);
  }

  return prisma.event.delete({
    where: { id },
  });
}

export async function getEvents(masjidId: string) {
  const access = await requireMasjidAccess(masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  return prisma.event.findMany({
    where: { masjidId },
    orderBy: { date: 'asc' },
  });
}

export async function getEventsById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { masjid: true },
  });
  if (!event) return null;
  const access = await requireMasjidAccess(event.masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  return event;
}
