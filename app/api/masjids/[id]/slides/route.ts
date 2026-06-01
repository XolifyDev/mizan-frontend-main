import { NextRequest, NextResponse } from 'next/server';
import { buildMasjidSlidesResponse } from '@/lib/mizantv/slides';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: masjidId } = await params;
    const { searchParams } = new URL(request.url);
    const displayId = searchParams.get('deviceId');
    const response = await buildMasjidSlidesResponse(masjidId, displayId);
    if (!response) {
      return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
} 
