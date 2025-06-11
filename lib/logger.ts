"use server"

import { prisma } from "@/lib/db"

interface LogEvent {
  action: "create" | "update" | "delete" | "login" | "logout" | "view" | "download" | "export"
  entityType: string
  entityId: string
  userId: string
  details?: string
}

export async function logEvent({
  action,
  entityType,
  entityId,
  userId,
  details,
}: LogEvent) {
  try {
    await prisma.systemLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        details,
      },
    })
  } catch (error) {
    console.error("Error logging event:", error)
  }
}

// Helper function to log user actions
export async function logUserAction(
  userId: string,
  action: LogEvent["action"],
  entityType: string,
  entityId: string,
  details?: string
) {
  await logEvent({
    action,
    entityType,
    entityId,
    userId,
    details,
  })
}

// Helper function to log system events
export async function logSystemEvent(
  action: LogEvent["action"],
  entityType: string,
  entityId: string,
  details?: string
) {
  await logEvent({
    action,
    entityType,
    entityId,
    userId: "system",
    details,
  })
}

// Specific logging functions for common actions
export async function logMasjidAction(
  userId: string,
  action: LogEvent["action"],
  masjidId: string,
  details?: string
) {
  await logUserAction(userId, action, "masjid", masjidId, details)
}

export async function logDonationAction(
  userId: string,
  action: LogEvent["action"],
  donationId: string,
  details?: string
) {
  await logUserAction(userId, action, "donation", donationId, details)
}

export async function logUserManagementAction(
  userId: string,
  action: LogEvent["action"],
  targetUserId: string,
  details?: string
) {
  await logUserAction(userId, action, "user", targetUserId, details)
}

export async function logDeviceAction(
  userId: string,
  action: LogEvent["action"],
  deviceId: string,
  details?: string
) {
  await logUserAction(userId, action, "device", deviceId, details)
}

export async function logContentAction(
  userId: string,
  action: LogEvent["action"],
  contentId: string,
  details?: string
) {
  await logUserAction(userId, action, "content", contentId, details)
}

export async function logAnnouncementAction(
  userId: string,
  action: LogEvent["action"],
  announcementId: string,
  details?: string
) {
  await logUserAction(userId, action, "announcement", announcementId, details)
}

export async function logEventAction(
  userId: string,
  action: LogEvent["action"],
  eventId: string,
  details?: string
) {
  await logUserAction(userId, action, "event", eventId, details)
}

export async function logPrayerTimeAction(
  userId: string,
  action: LogEvent["action"],
  prayerTimeId: string,
  details?: string
) {
  await logUserAction(userId, action, "prayerTime", prayerTimeId, details)
}

export async function logIqamahTimingAction(
  userId: string,
  action: LogEvent["action"],
  iqamahTimingId: string,
  details?: string
) {
  await logUserAction(userId, action, "iqamahTiming", iqamahTimingId, details)
}

export async function logKioskAction(
  userId: string,
  action: LogEvent["action"],
  kioskId: string,
  details?: string
) {
  await logUserAction(userId, action, "kiosk", kioskId, details)
}

export async function logTVDisplayAction(
  userId: string,
  action: LogEvent["action"],
  displayId: string,
  details?: string
) {
  await logUserAction(userId, action, "tvDisplay", displayId, details)
} 