"use server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/actions/user";

export async function GET() {
  const user = await getUser();
  if (!user || !user.admin) {
    return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: {
      type: "kiosk",
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(products);
}
