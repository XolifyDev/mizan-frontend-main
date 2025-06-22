import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ masjidId: string }> }
) {
  try {
    const { masjidId } = await params;

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
      },
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
        lastSeen: true,
        config: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      devices
    })

  } catch (error) {
    console.error("Error getting masjid devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 