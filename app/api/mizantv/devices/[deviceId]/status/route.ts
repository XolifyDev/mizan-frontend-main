import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    const body = await request.json();
    const { status, lastSeen, networkStatus } = body;

    if (!deviceId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, status" },
        { status: 400 }
      );
    }

    // Find device by id (deviceId is the id)
    const device = await prisma.tVDisplay.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    // Update device status
    const updatedDevice = await prisma.tVDisplay.update({
      where: { id: deviceId },
      data: {
        status,
        lastSeen: lastSeen ? new Date(lastSeen) : new Date(),
        networkStatus: networkStatus || "connected",
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      deviceId: updatedDevice.id,
      status: updatedDevice.status,
      lastSeen: updatedDevice.lastSeen,
      networkStatus: updatedDevice.networkStatus
    });

  } catch (error) {
    console.error("Error updating device status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 