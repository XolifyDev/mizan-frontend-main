import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await request.json();

    const version =
      typeof body.version === "string" && body.version.trim().length > 0
        ? body.version.trim()
        : null;

    const updated = await prisma.tVDisplay.update({
      where: { id: deviceId },
      data: {
        lastContentVersion: version,
        lastContentAckAt: new Date(),
        status: "online",
        networkStatus: "connected",
        lastSeen: new Date(),
      },
      select: {
        id: true,
        lastContentVersion: true,
        lastContentAckAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      deviceId: updated.id,
      version: updated.lastContentVersion,
      acknowledgedAt: updated.lastContentAckAt,
    });
  } catch (error) {
    console.error("Failed to save content ack:", error);
    return NextResponse.json(
      { error: "Failed to save content acknowledgement" },
      { status: 500 }
    );
  }
}
