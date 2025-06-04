"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllTVDisplays(masjidId: string) {
  try {
    const displays = await prisma.tVDisplay.findMany({
      where: {
        masjidId: masjidId
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
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return display;
  } catch (error) {
    console.error("Error updating display status:", error);
    throw new Error("Failed to update display status");
  }
} 