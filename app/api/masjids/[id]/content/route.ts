"use server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const content = await prisma.content.findMany({
    where: {
      masjidId: id,
    },
    include: {
        displays: true,
        assignedToDisplays: true,
        announcements: true,
    }
  });
  const announcements = await prisma.announcement.findMany({
    where: {
      masjidId: id,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  // console.log(content, announcements);
  return NextResponse.json({ content, announcements });
}