"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAllContentTemplates(masjidId: string) {
  try {
    const templates = await prisma.content.findMany({
      where: {
        masjidId: masjidId,
        active: true, // Only get active templates by default
      },
      select: {
        id: true,
        title: true,
        type: true,
        url: true,
        data: true,
        startDate: true,
        endDate: true,
        zones: true,
        active: true,
        masjidId: true,
        createdAt: true,
        updatedAt: true,
        description: true,
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

export async function getAllContentTemplatesIncludingInactive(masjidId: string) {
  try {
    const templates = await prisma.content.findMany({
      where: {
        masjidId: masjidId
      },
      select: {
        id: true,
        title: true,
        type: true,
        url: true,
        data: true,
        startDate: true,
        endDate: true,
        zones: true,
        active: true,
        masjidId: true,
        createdAt: true,
        updatedAt: true,
        description: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching all content templates:", error);
    throw new Error("Failed to fetch all content templates");
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
        title: data.name, // Map name to title
        type: data.type as any,
        description: data.description,
        active: data.active,
        masjidId: data.masjidId,
        zones: "[]", // Default empty zones as string
        data: data.config || {}, // Store config in data field
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
    const updateData: any = { ...data };
    if (data.name) {
      updateData.title = data.name; // Also update title when name changes
    }
    
    const template = await prisma.content.update({
      where: { id },
      data: updateData,
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

// New optimized function to get templates by type
export async function getContentTemplatesByType(masjidId: string, type: string) {
  try {
    const templates = await prisma.content.findMany({
      where: {
        masjidId: masjidId,
        type: type as any,
        active: true,
      },
      select: {
        id: true,
        title: true,
        type: true,
        data: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching content templates by type:", error);
    throw new Error("Failed to fetch content templates by type");
  }
}

// New function to get templates with pagination
export async function getContentTemplatesPaginated(masjidId: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    const [templates, total] = await Promise.all([
      prisma.content.findMany({
        where: {
          masjidId: masjidId
        },
        select: {
          id: true,
          title: true,
          type: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.content.count({
        where: {
          masjidId: masjidId
        }
      })
    ]);
    
    return {
      templates,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching paginated content templates:", error);
    throw new Error("Failed to fetch paginated content templates");
  }
}