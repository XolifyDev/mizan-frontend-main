import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, masjidId, deviceInfo } = body;

    if (!deviceId || !masjidId || !deviceInfo) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, masjidId, deviceInfo" },
        { status: 400 }
      );
    }

    // Check if device already exists (using deviceId as the id)
    const existingDevice = await prisma.tVDisplay.findUnique({
      where: { id: deviceId }
    });

    if (existingDevice) {
      // Update existing device
      const updatedDevice = await prisma.tVDisplay.update({
        where: { id: deviceId },
        data: {
          masjidId,
          name: deviceInfo.deviceName || existingDevice.name,
          platform: deviceInfo.platform,
          model: deviceInfo.model,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
          buildNumber: deviceInfo.buildNumber,
          installationId: deviceInfo.installationId,
          status: "online",
          lastSeen: new Date(),
          networkStatus: "connected",
          registeredAt: existingDevice.registeredAt || new Date(),
          updatedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        deviceId: updatedDevice.id,
        masjidId: updatedDevice.masjidId,
        message: "Device updated successfully"
      });
    }

    // Create new device using deviceId as the id
    const newDevice = await prisma.tVDisplay.create({
      data: {
        id: deviceId, // Use the deviceId as the id
        masjidId,
        name: deviceInfo.deviceName || `MizanTV Display ${deviceInfo.platform}`,
        platform: deviceInfo.platform,
        model: deviceInfo.model,
        osVersion: deviceInfo.osVersion,
        appVersion: deviceInfo.appVersion,
        buildNumber: deviceInfo.buildNumber,
        installationId: deviceInfo.installationId,
        status: "online",
        lastSeen: new Date(),
        networkStatus: "connected",
        registeredAt: new Date(),
        isActive: true,
        location: "Main Hall", // Default location
        config: {
          slideDuration: 10000,
          theme: "default",
          customSettings: {
            showClock: true,
            showWeather: false,
            autoRotate: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      deviceId: newDevice.id,
      masjidId: newDevice.masjidId,
      message: "Device registered successfully"
    });

  } catch (error) {
    console.error("Error registering device:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 