import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logMasjidAction } from "@/lib/logger"
import { getUserMasjid } from "@/lib/actions/masjid"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const masjid = await prisma.masjid.create({
      data: {
        ...data,
        ownerId: data.ownerId,
      },
    })

    // Log the creation
    await logMasjidAction(
      data.ownerId,
      "create",
      masjid.id,
      `Created new masjid: ${masjid.name}`
    )

    return NextResponse.json(masjid)
  } catch (error) {
    console.error("Error creating masjid:", error)
    return NextResponse.json(
      { error: "Failed to create masjid" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const masjids = await prisma.masjid.findMany({
      where: userId ? { ownerId: userId } : undefined,
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the view
    if (userId) {
      await logMasjidAction(
        userId,
        "view",
        "all",
        `Viewed all masjids for user ${userId}`
      )
    }

    return NextResponse.json(masjids)
  } catch (error) {
    console.error("Error fetching masjids:", error)
    return NextResponse.json(
      { error: "Failed to fetch masjids" },
      { status: 500 }
    )
  }
} 


export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const masjidId = searchParams.get("masjidId") || undefined;
  const masjid = await getUserMasjid(masjidId);
  return NextResponse.json(masjid);
}