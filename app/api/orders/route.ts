"use server";

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const orders = await prisma.orders.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      masjid: true,
      user: true,
    },
  });
  return NextResponse.json(orders);
}