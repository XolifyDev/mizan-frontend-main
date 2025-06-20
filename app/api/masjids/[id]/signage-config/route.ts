import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const displayId = searchParams.get('displayId');

  try {
    let signageConfig;
    if (displayId) {
      signageConfig = await prisma.signageConfig.findFirst({
        where: { masjidId: id, displayId: displayId },
      });
    } else {
      signageConfig = await prisma.signageConfig.findFirst({
        where: { masjidId: id, displayId: null },
      });
    }
    return NextResponse.json(signageConfig?.config || { slides: [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch signage config' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const displayId = searchParams.get('displayId');

  try {
    const body = await req.json();
    const config = body;
    const signageConfig = await prisma.signageConfig.upsert({
      where: { 
        masjidId_displayId: {
          masjidId: id,
          displayId: displayId || null,
        }
      },
      update: { config },
      create: { masjidId: id, displayId: displayId || null, config },
    });
    return NextResponse.json(signageConfig.config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save signage config' }, { status: 500 });
  }
} 