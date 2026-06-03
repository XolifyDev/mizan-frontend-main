import { google } from 'googleapis';
import { prisma } from '../db';
import type { Event, Masjid } from '@prisma/client';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function syncEventToGoogleCalendar(eventId: string, data?: Event & { masjid?: Masjid | null }) {
  try {
    const event = (data as (Event & { masjid?: Masjid | null }) | undefined) || await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.syncToGoogleCalendar) {
      return;
    }

    // Get the masjid's Google Calendar credentials
    const masjid = await prisma.masjid.findUnique({
      where: { id: event.masjidId },
      select: { googleCalendarCredentials: true, googleCalendarId: true },
    });

    if (!masjid?.googleCalendarCredentials || !masjid.googleCalendarId) {
      throw new Error('Google Calendar not configured for this masjid');
    }

    // Set up the Google Calendar client
    const credentials = masjid.googleCalendarCredentials as Record<string, unknown>;
    oauth2Client.setCredentials(credentials);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const timezone = event.timezone || event.masjid?.timezone || 'America/New_York';

    // Prepare the event data
    const startDateTime = new Date(event.date);
    const [startHours, startMinutes] = event.timeStart.toTimeString().split(':');
    startDateTime.setHours(
      parseInt(startHours),
      parseInt(startMinutes),
      0
    );

    const endDateTime = new Date(event.date);
    const [endHours, endMinutes] = event.timeEnd.toTimeString().split(':');
    endDateTime.setHours(
      parseInt(endHours),
      parseInt(endMinutes),
      0
    );

    const calendarEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
    };

    const response = event.googleCalendarEventId
      ? await calendar.events.update({
          calendarId: masjid.googleCalendarId,
          eventId: event.googleCalendarEventId,
          requestBody: calendarEvent,
        })
      : await calendar.events.insert({
          calendarId: masjid.googleCalendarId,
          requestBody: calendarEvent,
        });

    // Update the event with the new Google Calendar event ID and sync status
    await prisma.event.update({
      where: { id: eventId },
      data: {
        googleCalendarEventId: response.data.id,
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error syncing event to Google Calendar:', error);
    
    // Update the event's sync status to failed
    await prisma.event.update({
      where: { id: eventId },
      data: {
        syncStatus: 'failed',
      },
    });

    throw error;
  }
}


export async function deleteEventFromGoogleCalendar(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { masjid: true },
    });

    if (!event?.googleCalendarEventId) {
      return;
    }

    const masjid = await prisma.masjid.findUnique({
      where: { id: event.masjidId },
      select: { googleCalendarCredentials: true, googleCalendarId: true },
    });

    if (!masjid?.googleCalendarCredentials || !masjid.googleCalendarId) {
      return;
    }

    const credentials = masjid.googleCalendarCredentials as Record<string, unknown>;
    oauth2Client.setCredentials(credentials);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: masjid.googleCalendarId,
      eventId: event.googleCalendarEventId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting event from Google Calendar:', error);
    throw error;
  }
} 
