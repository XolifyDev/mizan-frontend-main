import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { buildMasjidSlidesResponse } from "@/lib/mizantv/slides";

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const masjidId = searchParams.get("masjidId");
    const deviceId = searchParams.get("deviceId");
    console.log(deviceId, masjidId);

    if (!deviceId || !masjidId) {
      return NextResponse.json(
        { error: "Missing required parameters: deviceId, masjidId" },
        { status: 400 }
      );
    }

    // Find device by id (deviceId is the id)
    const device = await prisma.tVDisplay.findUnique({
      where: { id: deviceId },
      include: {
        masjid: true,
        assignedContent: true,
        displayedContent: true,
      }
    });

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const signageSlides = await buildMasjidSlidesResponse(masjidId, deviceId);

    const slides =
      signageSlides && signageSlides.slides.length > 0
        ? signageSlides.slides
        : (() => {
            const deviceContent = [];

            if (device.assignedContent) {
              deviceContent.push(device.assignedContent);
            }

            if (device.displayedContent && device.displayedContent.length > 0) {
              deviceContent.push(...device.displayedContent);
            }

            return deviceContent.map((content, index) => ({
              id: content.id,
              type: content.type,
              content: content.data || {},
              order: index,
              layout: "default",
              theme: device.config?.theme || "default",
              contentId: content.id,
            }));
          })();

    return NextResponse.json({
      masjid: {
        id: device.masjid.id,
        name: device.masjid.name,
        logo: device.masjid.logo,
      },
      slides,
      version: signageSlides?.version || `${device.updatedAt.getTime()}`,
      generatedAt: signageSlides?.generatedAt || new Date().toISOString(),
      deviceConfig: device.config || {
        slideDuration: 10000,
        theme: "default",
        customSettings: {
          showClock: true,
          showWeather: false,
          autoRotate: true
        }
      }
    });

  } catch (error) {
    console.error("Error getting device slides:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
