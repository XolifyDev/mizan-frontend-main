import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signRealtimeToken } from "@/lib/realtime/token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
    const masjidId = typeof body.masjidId === "string" ? body.masjidId.trim() : "";

    if (!deviceId || !masjidId) {
      return NextResponse.json(
        { error: "deviceId and masjidId are required" },
        { status: 400 }
      );
    }

    const display = await prisma.tVDisplay.findFirst({
      where: {
        id: deviceId,
        masjidId,
        isActive: true,
      },
      select: {
        id: true,
        masjidId: true,
        name: true,
      },
    });

    if (!display) {
      return NextResponse.json(
        { error: "Display is not assigned to this masjid" },
        { status: 404 }
      );
    }

    const verifiedPairing = await prisma.devicePairingSession.findFirst({
      where: {
        deviceId: display.id,
        requestedMasjidId: masjidId,
        status: "verified",
      },
      orderBy: {
        verifiedAt: "desc",
      },
      select: {
        id: true,
      },
    });

    if (!verifiedPairing) {
      return NextResponse.json(
        { error: "Display has not been verified on this device yet" },
        { status: 403 }
      );
    }

    const token = signRealtimeToken(
      {
        role: "device",
        deviceId: display.id,
        masjidId: display.masjidId,
      },
      60 * 60 * 24
    );

    return NextResponse.json({
      token,
      deviceId: display.id,
      masjidId: display.masjidId,
      realtimeUrl: process.env.NEXT_PUBLIC_REALTIME_URL || null,
      expiresIn: 60 * 60 * 24,
    });
  } catch (error) {
    console.error("Failed to create realtime device token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
