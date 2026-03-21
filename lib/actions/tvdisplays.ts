"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllTVDisplays(masjidId: string) {
  try {
    const displays = await prisma.tVDisplay.findMany({
      where: {
        masjidId: masjidId
      },
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        lastSeen: true,
        ipAddress: true,
        status: true,
        config: true,
        assignedContentId: true,
        masjidId: true,
        createdAt: true,
        updatedAt: true,
        // Only select necessary fields to reduce data transfer
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return displays;
  } catch (error) {
    console.error("Error fetching TV displays:", error);
    throw new Error("Failed to fetch TV displays");
  }
}

export async function createTVDisplay(data: {
  name: string;
  location: string;
  layout: string;
  isActive: boolean;
  config: {
    notes: string;
    autoPower: boolean;
  };
  status: string;
  assignedContentId: string | null;
  masjidId: string;
}) {
  try {
    const display = await prisma.tVDisplay.create({
      data: {
        name: data.name,
        location: data.location,
        layout: data.layout,
        isActive: data.isActive,
        config: data.config,
        status: data.status,
        assignedContentId: data.assignedContentId,
        masjidId: data.masjidId,
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return display;
  } catch (error) {
    console.error("Error creating TV display:", error);
    throw new Error("Failed to create TV display");
  }
}

export async function updateTVDisplay(id: string, data: {
  name: string;
  location: string;
  layout?: string;
  status: string;
  config?: {
    notes: string;
    autoPower: boolean;
  };
}) {
  try {
    const display = await prisma.tVDisplay.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        layout: data.layout,
        status: data.status,
        config: data.config,
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return display;
  } catch (error) {
    console.error("Error updating TV display:", error);
    throw new Error("Failed to update TV display");
  }
}

export async function deleteTVDisplay(id: string) {
  try {
    await prisma.tVDisplay.delete({
      where: { id },
    });
    revalidatePath("/dashboard/tv-displays");
  } catch (error) {
    console.error("Error deleting TV display:", error);
    throw new Error("Failed to delete TV display");
  }
}

export async function assignContentToDisplay(displayId: string, contentId: string) {
  try {
    const display = await prisma.tVDisplay.update({
      where: { id: displayId },
      data: {
        assignedContentId: contentId,
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return display;
  } catch (error) {
    console.error("Error assigning content to display:", error);
    throw new Error("Failed to assign content to display");
  }
}

export async function updateDisplayStatus(id: string, status: string) {
  try {
    const display = await prisma.tVDisplay.update({
      where: { id },
      data: {
        status,
        lastSeen: new Date(), // Update last seen when status changes
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return display;
  } catch (error) {
    console.error("Error updating display status:", error);
    throw new Error("Failed to update display status");
  }
}

// New optimized function to get display with content
export async function getTVDisplayWithContent(id: string) {
  try {
    const display = await prisma.tVDisplay.findUnique({
      where: { id },
      include: {
        assignedContent: {
          select: {
            id: true,
            title: true,
            type: true,
            data: true,
            active: true,
          }
        },
        masjid: {
          select: {
            id: true,
            name: true,
            address: true,
            logo: true,
          }
        }
      }
    });
    return display;
  } catch (error) {
    console.error("Error fetching TV display with content:", error);
    throw new Error("Failed to fetch TV display with content");
  }
}

// New function to get displays by status
export async function getTVDisplaysByStatus(masjidId: string, status: string) {
  try {
    const displays = await prisma.tVDisplay.findMany({
      where: {
        masjidId: masjidId,
        status: status
      },
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: {
        lastSeen: "desc",
      },
    });
    return displays;
  } catch (error) {
    console.error("Error fetching TV displays by status:", error);
    throw new Error("Failed to fetch TV displays by status");
  }
}