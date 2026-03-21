import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logDonationAction } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const donation = await prisma.donation.create({
      data: {
        ...data,
        status: "pending",
      },
      include: {
        masjid: true,
        category: true,
      },
    })

    // Log the creation
    await logDonationAction(
      data.userId || "anonymous",
      "create",
      donation.id,
      `Created new donation of ${donation.amount} for ${donation.category.name}`
    )

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const masjidId = searchParams.get("masjidId")
    const categoryId = searchParams.get("categoryId")
    const status = searchParams.get("status")

    const donations = await prisma.donation.findMany({
      where: {
        ...(masjidId && { masjidId }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
      },
      include: {
        masjid: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Log the view
    if (masjidId) {
      await logDonationAction(
        "system",
        "view",
        "all",
        `Viewed all donations for masjid ${masjidId}`
      )
    }

    return NextResponse.json(donations)
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
} 