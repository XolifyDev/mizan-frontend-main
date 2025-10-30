import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    if (!deviceId) {
      return NextResponse.json(
        { error: "Missing required parameter: deviceId" },
        { status: 400 }
      );
    }

    // Find device by id (deviceId is the id)
    const device = await prisma.tVDisplay.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        masjidId: true,
        config: true,
        status: true,
        lastSeen: true,
        networkStatus: true,
      }
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      deviceId: device.id,
      masjidId: device.masjidId,
      config: device.config || {
        slideDuration: 10000,
        theme: "default",
        customSettings: {
          showClock: true,
          showWeather: false,
          autoRotate: true
        }
      },
      status: device.status,
      lastSeen: device.lastSeen,
      networkStatus: device.networkStatus
    });

  } catch (error) {
    console.error("Error getting device config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Missing required parameter: deviceId" },
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

    // Update device configuration
    const updatedDevice = await prisma.tVDisplay.update({
      where: { id: deviceId },
      data: {
        config: {
          ...device.config,
          ...body
        },
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      deviceId: updatedDevice.id,
      config: updatedDevice.config
    });

  } catch (error) {
    console.error("Error updating device config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 