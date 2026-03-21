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
  const deviceId = await request.headers.get("Authorization");
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
    data: {
      lastSeen: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        new Date().getHours(),
        new Date().getMinutes()
      )
    }
  });

  return NextResponse.json({ message: "Health check successful" });
} 