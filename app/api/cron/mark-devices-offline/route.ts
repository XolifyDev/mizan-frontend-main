import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get the current time minus 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Find all devices that haven't been seen in the last 5 minutes and are currently online
    const inactiveDevices = await prisma.tVDisplay.findMany({
      where: {
        status: "online",
        lastSeen: {
          lt: twoMinutesAgo
        },
        masjidId: {
          not: undefined
        }
      }
    });

    if (inactiveDevices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No inactive devices found",
        devicesMarkedOffline: 0
      });
    }

    // Update all inactive devices to offline status
    const updateResult = await prisma.tVDisplay.updateMany({
      where: {
        id: {
          in: inactiveDevices.map(device => device.id)
        }
      },
      data: {
        status: "offline",
        updatedAt: new Date()
      }
    });

    console.log(`Marked ${updateResult.count} devices as offline due to inactivity`);

    return NextResponse.json({
      success: true,
      message: `Marked ${updateResult.count} devices as offline`,
      devicesMarkedOffline: updateResult.count,
    });

  } catch (error) {
    console.error("Error marking devices offline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 