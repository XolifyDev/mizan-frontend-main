import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: masjidId } = await params;
    const { searchParams } = new URL(request.url);
    const displayId = searchParams.get('deviceId');


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

    // Get all slides and fetch their latest content
    const slides = (signageConfig.config as any).slides;
    const slidesWithLatestContent = await Promise.all(
      slides.map(async (slide: any) => {
        if (slide.contentId) {
          if (slide.type === 'announcements') {
            // Fetch announcement data for announcement slides
            const announcement = await prisma.announcement.findUnique({
              where: { id: slide.contentId }
            });
            
            if (announcement) {
              return {
                ...slide,
                content: announcement
              };
            }
          } else {
            // Fetch content data for content slides
            const latestContent = await prisma.content.findUnique({
              where: { id: slide.contentId }
            });
            
            if (latestContent) {
              return {
                ...slide,
                content: latestContent
              };
            }
          }
        }
        return slide;
      })
    );


    
    // Filter slides to only include those with active content or custom slides
    let activeSlides = slidesWithLatestContent.filter((slide: any) => {
      // Always include custom slides
      if (slide.type === 'custom') {
        return true;
      }
      
      // For announcement slides, check if announcement is active
      if (slide.type === 'announcements' && slide.content) {
        return slide.content.active === true;
      }
      
      // For content slides, check if content is active
      if (slide.content) {
        return slide.content.active === true;
      }
      
      return false;
    });
  
  
    // Filter slides based on start and end dates (only for non-custom slides)
    const now = new Date();
    const activeDateSlides = activeSlides.filter((slide: any) => {
      // Always include custom slides
      if (slide.type === 'custom') {
        return true;
      }

      // For announcement slides, check announcement dates
      if (slide.type === 'announcements' && slide.content) {
        const startDate = slide.content.startDate ? new Date(slide.content.startDate) : null;
        const endDate = slide.content.endDate ? new Date(slide.content.endDate) : null;

        // Check if current time is within the date range
        const afterStart = !startDate || now >= startDate;
        const beforeEnd = !endDate || now <= endDate;

        return afterStart && beforeEnd;
      }

      // For content slides, check content dates
      if (slide.content) {
        if (!slide.content.startDate && !slide.content.endDate) {
          return true; // If no dates set, always show
        }
        
        const startDate = slide.content.startDate ? new Date(slide.content.startDate) : null;
        const endDate = slide.content.endDate ? new Date(slide.content.endDate) : null;

        // Check if current time is within the date range
        const afterStart = !startDate || now >= startDate;
        const beforeEnd = !endDate || now <= endDate;

        return afterStart && beforeEnd;
      }

      return false;
    });

    // Update activeSlides to use date-filtered version
    activeSlides = activeDateSlides;

    // Return the slides and the masjid info
    return NextResponse.json({
        masjid: {
            id: masjid.id,
            name: masjid.name,
            logo: masjid.logo,
        },
        slides: activeSlides
    });

  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
} 