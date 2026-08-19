import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/actions/user";

async function getPairingSession(code: string) {
  return prisma.devicePairingSession.findUnique({
    where: { code },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const session = await getPairingSession(code);

    if (!session) {
      return NextResponse.json({ error: "Pairing session not found" }, { status: 404 });
    }

    if (session.expiresAt < new Date() && session.status === "pending") {
      await prisma.devicePairingSession.update({
        where: { id: session.id },
        data: { status: "expired" },
      });
      session.status = "expired";
    }

    // Look up device and masjid separately (no FK relation)
    const device = await prisma.tVDisplay.findUnique({
      where: { id: session.deviceId },
      select: {
        id: true,
        name: true,
        masjidId: true,
        masjid: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    return NextResponse.json({
      code: session.code,
      status: session.status,
      expiresAt: session.expiresAt,
      verifiedAt: session.verifiedAt,
      device: device ? { id: device.id, name: device.name } : null,
      masjid: session.status === "verified" && device ? device.masjid : null,
    });
  } catch (error) {
    console.error("Failed to fetch device pairing session:", error);
    return NextResponse.json(
      { error: "Failed to fetch pairing session" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const masjidId = typeof body.masjidId === "string" ? body.masjidId.trim() : "";

    if (!masjidId) {
      return NextResponse.json({ error: "masjidId is required" }, { status: 400 });
    }

    const session = await getPairingSession(code);
    if (!session) {
      return NextResponse.json({ error: "Pairing session not found" }, { status: 404 });
    }

    if (session.status !== "pending" || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Pairing session is no longer valid" },
        { status: 409 }
      );
    }

    const allowedMasjid = user.masjids.find((masjid) => masjid.id === masjidId);
    if (!allowedMasjid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upsert the TVDisplay row, assigning it to the verified masjid
    const device = await prisma.tVDisplay.upsert({
      where: { id: session.deviceId },
      create: {
        id: session.deviceId,
        name: `MizanTV ${session.deviceId.slice(0, 8)}`,
        masjidId,
        status: "online",
        isActive: true,
        location: "Main Hall",
        config: {},
        registeredAt: new Date(),
      },
      update: {
        masjidId,
        status: "online",
        isActive: true,
        lastSeen: new Date(),
      },
      select: {
        id: true,
        name: true,
        masjid: { select: { id: true, name: true, logo: true } },
      },
    });

    const updated = await prisma.devicePairingSession.update({
      where: { id: session.id },
      data: {
        status: "verified",
        requestedMasjidId: masjidId,
        requestedByUserId: user.id,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      device,
      masjid: device.masjid,
    });
  } catch (error) {
    console.error("Failed to verify device pairing session:", error);
    return NextResponse.json(
      { error: "Failed to verify pairing session" },
      { status: 500 }
    );
  }
}
