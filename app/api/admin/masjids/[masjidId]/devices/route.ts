import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { masjidId: string } }
) {
  try {
    const masjidId = params.masjidId;

    if (!masjidId) {
      return NextResponse.json(
        { error: "Missing required parameter: masjidId" },
        { status: 400 }
      );
    }

    // Get all MizanTV devices for the masjid (devices with platform field)
    const devices = await prisma.tVDisplay.findMany({
      where: {
        masjidId,
        platform: { not: null } // Only MizanTV devices
      },
      select: {
        id: true,
        name: true,
        location: true,
        platform: true,
        model: true,
        osVersion: true,
        appVersion: true,
        status: true,
        lastSeen: true,
        networkStatus: true,
        registeredAt: true,
        config: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      devices: devices.map(device => ({
        ...device,
        deviceId: device.id, // Map id to deviceId for consistency
        lastSeen: device.lastSeen?.toISOString(),
        registeredAt: device.registeredAt?.toISOString(),
        createdAt: device.createdAt.toISOString(),
        updatedAt: device.updatedAt.toISOString(),
      }))
    });

  } catch (error) {
    console.error("Error getting masjid devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 