import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ pending: false });

  const order = await prisma.orders.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["processing", "pending"] },
    },
    select: { id: true },
  });

  return NextResponse.json({ pending: Boolean(order) });
}
