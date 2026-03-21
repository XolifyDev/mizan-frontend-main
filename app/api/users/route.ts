import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logUserManagementAction } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const admin = searchParams.get("admin")

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(admin && { admin: admin === "true" }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        admin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log the view
    await logUserManagementAction(
      "system",
      "view",
      "all",
      `Viewed all users with filters: role=${role}, admin=${admin}`
    )

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Log the update
    await logUserManagementAction(
      "system",
      "update",
      user.id,
      `Updated user ${user.email} with data: ${JSON.stringify(updateData)}`
    )

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.delete({
      where: { id },
    })

    // Log the deletion
    await logUserManagementAction(
      "system",
      "delete",
      user.id,
      `Deleted user ${user.email}`
    )

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
} 