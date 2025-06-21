import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: masjidId } = await params;
    const { searchParams } = new URL(request.url);
    const displayId = searchParams.get('displayId');
    

    const masjid = await prisma.masjid.findUnique({
        where: { id: masjidId }
    });

    if (!masjid) {
        return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    let signageConfig;
    
    // If a displayId is provided, find the config for that specific display.
    // Otherwise, find the first config for the masjid.
    if (displayId) {
        signageConfig = await prisma.signageConfig.findFirst({
            where: { 
                masjidId: masjidId,
                displayId: displayId,
            }
        });
    } else {
        signageConfig = await prisma.signageConfig.findFirst({
            where: { masjidId: masjidId }
        });
    }

    if (!signageConfig || !signageConfig.config || !(signageConfig.config as any).slides) {
      return NextResponse.json({ 
        masjid: {
            id: masjid.id,
            name: masjid.name,
            logo: masjid.logo,
        },
        slides: [] 
      });
    }

    // Return the slides and the masjid info
    return NextResponse.json({
        masjid: {
            id: masjid.id,
            name: masjid.name,
            logo: masjid.logo,
        },
        slides: (signageConfig.config as any).slides
    });

  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
} 