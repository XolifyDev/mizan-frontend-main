import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logSystemEvent } from "@/lib/logger"

interface HealthMetrics {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  database: {
    status: "connected" | "disconnected"
    latency: number
    error?: string
  }
  metrics: {
    totalUsers: number
    totalMasjids: number
    totalDonations: number
    totalDevices: number
    totalContent: number
    totalAnnouncements: number
    totalEvents: number
  }
}

export async function GET(request: Request) {
  // get device id from headers "Authorization"
  const deviceId = request.headers.get("Authorization");
  if (!deviceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get device status from database
  const device = await prisma.tVDisplay.findFirst({
    where: { id: deviceId.replace("Device: ", "") }
  });

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // update device lastSeen
  await prisma.tVDisplay.update({
    where: { id: device.id },
    data: { lastSeen: new Date() }
  });

  const startTime = Date.now()
  const metrics: HealthMetrics = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: {
      status: "connected",
      latency: 0,
    },
    metrics: {
      totalUsers: 0,
      totalMasjids: 0,
      totalDonations: 0,
      totalDevices: 0,
      totalContent: 0,
      totalAnnouncements: 0,
      totalEvents: 0,
    },
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    metrics.database.latency = Date.now() - startTime

    // Get basic metrics
    const [
      users,
      masjids,
      donations,
      devices,
      content,
      announcements,
      events,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.masjid.count(),
      prisma.donation.count(),
      prisma.device.count(),
      prisma.content.count(),
      prisma.announcement.count(),
      prisma.event.count(),
    ])

    metrics.metrics = {
      totalUsers: users,
      totalMasjids: masjids,
      totalDonations: donations,
      totalDevices: devices,
      totalContent: content,
      totalAnnouncements: announcements,
      totalEvents: events,
    }

    // Log the health check
    await logSystemEvent(
      "view",
      "health",
      "system",
      `Health check completed: ${JSON.stringify(metrics)}`
    )

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Health check failed:", error)
    metrics.status = "unhealthy"
    metrics.database.status = "disconnected"
    metrics.database.error = error instanceof Error ? error.message : "Unknown error"

    // Log the health check failure
    await logSystemEvent(
      "view",
      "health",
      "system",
      `Health check failed: ${metrics.database.error}`
    )

    return NextResponse.json(metrics, { status: 503 })
  }
} 