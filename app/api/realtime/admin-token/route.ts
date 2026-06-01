import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { signRealtimeToken } from "@/lib/realtime/token";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const masjidId = searchParams.get("masjidId");

    if (!masjidId) {
      return NextResponse.json({ error: "masjidId is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        admin: true,
        masjids: {
          where: { id: masjidId },
          select: { id: true },
        },
      },
    });

    if (!user || (!user.admin && user.masjids.length === 0)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const token = signRealtimeToken(
      {
        role: "admin",
        userId: session.user.id,
        masjidId,
      },
      60 * 15
    );

    return NextResponse.json({
      token,
      realtimeUrl: process.env.NEXT_PUBLIC_REALTIME_URL || null,
      expiresIn: 60 * 15,
    });
  } catch (error) {
    console.error("Failed to create realtime admin token:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
