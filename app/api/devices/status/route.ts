"use server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // get device id from searchParams
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    console.log(deviceId);
    if (!deviceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get device status from database
    const device = await prisma.tVDisplay.findFirst({
        where: { id: deviceId }
    });

    if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ status: device.status });
}

export async function POST(request: Request) {
    const body = await request.json();
    
    // get device id from searchParams
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    if (!deviceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get device status from database
    const device = await prisma.tVDisplay.findFirst({
        where: { id: deviceId }
    });

    if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // update device status
    const updatedDevice = await prisma.tVDisplay.update({
        where: { id: deviceId },
        data: { status: body.status, lastSeen: body.lastSeen }
    });

    return NextResponse.json({ status: updatedDevice.status });
}