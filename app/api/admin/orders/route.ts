import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.admin ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orders = await prisma.orders.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, masjid: true },
  });

  return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status, trackingNumber } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const order = await prisma.orders.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(trackingNumber !== undefined && { trackingNumber }),
    },
  });

  return NextResponse.json(order);
}
