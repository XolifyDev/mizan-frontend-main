"use server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  if (!query) {
    return new Response("No query provided", { status: 400 });
  }
  const masjids = await prisma.masjid.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      country: true,
      phone: true,
      email: true,
      logo: true,
    },
  });
  return NextResponse.json(masjids);
}