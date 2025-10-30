"use server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const StatusUpdateSchema = z.object({
  status: z.enum(['online', 'offline', 'restarting', 'stopped', 'error']),
  lastSeen: z.string().optional(),
  networkStatus: z.string().optional(),
  content: z.string().optional(),
  lastContentUpdate: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    const device = await prisma.tVDisplay.findFirst({
      where: { id: deviceId },
      select: {
        id: true,
        status: true,
        lastSeen: true,
        networkStatus: true,
        content: true,
        lastContentUpdate: true,
        name: true,
        location: true,
      }
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      device: {
        id: device.id,
        status: device.status,
        lastSeen: device.lastSeen,
        networkStatus: device.networkStatus,
        content: device.content,
        lastContentUpdate: device.lastContentUpdate,
        name: device.name,
        location: device.location,
      }
    });
  } catch (error) {
    console.error("Error fetching device status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = StatusUpdateSchema.parse(body);

    // Check if device exists
    const existingDevice = await prisma.tVDisplay.findFirst({
      where: { id: deviceId }
    });

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Update device status
    const updatedDevice = await prisma.tVDisplay.update({
      where: { id: deviceId },
      data: {
        status: validatedData.status,
        lastSeen: validatedData.lastSeen ? new Date(validatedData.lastSeen) : new Date(),
        networkStatus: validatedData.networkStatus,
        content: validatedData.content,
        lastContentUpdate: validatedData.lastContentUpdate ? new Date(validatedData.lastContentUpdate) : undefined,
      },
      select: {
        id: true,
        status: true,
        lastSeen: true,
        networkStatus: true,
        content: true,
        lastContentUpdate: true,
        name: true,
        location: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      device: updatedDevice
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data",
        details: error.errors
      }, { status: 400 });
    }
    
    console.error("Error updating device status:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}