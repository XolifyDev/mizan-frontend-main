"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllContentTemplates(masjidId: string) {
  try {
    const templates = await prisma.content.findMany({
      where: {
        masjidId: masjidId
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching content templates:", error);
    throw new Error("Failed to fetch content templates");
  }
}

export async function createContentTemplate(data: {
  name: string;
  type: string;
  description: string;
  active: boolean;
  config: {
    layout: string;
    refreshInterval: number;
    customSettings?: Record<string, any>;
  };
  masjidId: string;
}) {
  try {
    const template = await prisma.content.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        active: data.active,
        config: data.config,
        masjidId: data.masjidId,
      },
    });
    revalidatePath("/dashboard/tv-displays");
    return template;
  } catch (error) {
    console.error("Error creating content template:", error);
    throw new Error("Failed to create content template");
  }
}

export async function updateContentTemplate(id: string, data: {
  name?: string;
  type?: string;
  description?: string;
  active?: boolean;
  config?: {
    layout?: string;
    refreshInterval?: number;
    customSettings?: Record<string, any>;
  };
}) {
  try {
    const template = await prisma.content.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/tv-displays");
    return template;
  } catch (error) {
    console.error("Error updating content template:", error);
    throw new Error("Failed to update content template");
  }
}

export async function deleteContentTemplate(id: string) {
  try {
    await prisma.content.delete({
      where: { id },
    });
    revalidatePath("/dashboard/tv-displays");
  } catch (error) {
    console.error("Error deleting content template:", error);
    throw new Error("Failed to delete content template");
  }
}

export async function toggleContentTemplate(id: string, active: boolean) {
  try {
    const template = await prisma.content.update({
      where: { id },
      data: { active },
    });
    revalidatePath("/dashboard/tv-displays");
    return template;
  } catch (error) {
    console.error("Error toggling content template:", error);
    throw new Error("Failed to toggle content template");
  }
} 