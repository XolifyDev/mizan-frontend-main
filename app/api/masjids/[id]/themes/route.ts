import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const themes = await prisma.theme.findMany({
      where: { masjidId: id },
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform the themes to match our ThemeConfig type
    const transformedThemes = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.configJson.description || '',
      colors: theme.configJson.colors || {},
      fonts: theme.configJson.fonts || {},
      spacing: theme.configJson.spacing || {},
      effects: theme.configJson.effects || {},
    }));
    
    return NextResponse.json(transformedThemes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, colors, fonts, spacing, effects } = body;
    
    const theme = await prisma.theme.create({
      data: {
        masjidId: id,
        name,
        configJson: {
          description,
          colors,
          fonts,
          spacing,
          effects,
        },
      },
    });
    
    // Return the transformed theme
    return NextResponse.json({
      id: theme.id,
      name: theme.name,
      description: theme.configJson.description || '',
      colors: theme.configJson.colors || {},
      fonts: theme.configJson.fonts || {},
      spacing: theme.configJson.spacing || {},
      effects: theme.configJson.effects || {},
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
} 