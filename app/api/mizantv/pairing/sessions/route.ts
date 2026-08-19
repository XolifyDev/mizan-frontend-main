import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";

function createCode() {
  return randomBytes(8).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    // Expire any existing pending sessions for this device
    await prisma.devicePairingSession.updateMany({
      where: {
        deviceId,
        status: "pending",
      },
      data: {
        status: "expired",
      },
    });

    const session = await prisma.devicePairingSession.create({
      data: {
        code: createCode(),
        deviceId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
      },
      select: {
        code: true,
        expiresAt: true,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://mizan-frontend.vercel.app";

    return NextResponse.json({
      code: session.code,
      expiresAt: session.expiresAt,
      verificationUrl: `${baseUrl.replace(/\/$/, "")}/dashboard/signage/verify-device?code=${session.code}`,
    });
  } catch (error) {
    console.error("Failed to create device pairing session:", error);
    return NextResponse.json(
      { error: "Failed to create pairing session" },
      { status: 500 }
    );
  }
}
