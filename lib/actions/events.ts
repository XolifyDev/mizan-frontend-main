"use server";

import { prisma } from "../db";
import { syncEventToGoogleCalendar, deleteEventFromGoogleCalendar } from "./google-calendar";

export async function createEvent(data: any) {
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
    }
  }

  return event;
}

export async function updateEvent(id: string, data: any) {
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      syncToGoogleCalendar: data.syncToGoogleCalendar || false,
      googleCalendarEventId: data.syncToGoogleCalendar ? undefined : null,
      lastSyncedAt: data.syncToGoogleCalendar ? undefined : null,
      syncStatus: data.syncToGoogleCalendar ? 'pending' : null,
    },
  });

  if (data.syncToGoogleCalendar) {
    try {
      await syncEventToGoogleCalendar(event.id);
    } catch (error) {
      console.error('Error syncing event to Google Calendar:', error);
    }
  }

  return event;
}

export async function deleteEvent(id: string) {
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
  return event;
}