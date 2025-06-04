"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: any) {
  const { masjidId, token } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    return NextResponse.redirect(new URL(`/signin?redirect=${request.url}`, request.url))
  }

  const masjid = await prisma.masjid.findUnique({
    where: {
      id: masjidId,
    },
  })

  if (!masjid) {
    return NextResponse.redirect(new URL(`/error?message=Invalid masjid`, request.url))
  }

  const invite = await prisma.masjidInvite.findFirst({
    where: {
      token: token,
    },
  });

  if (invite?.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL(`/error?message=Invite has expired`, request.url))
  }

  if (!invite) {
    return NextResponse.redirect(new URL(`/error?message=Invalid invite`, request.url))
  }

  const updatedMasjid = await prisma.masjid.update({
    where: {
      id: masjidId,
    },
    data: {
      users: {
        connect: {
          id: session.user.id,
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      masjids: {
        connect: {
          id: masjidId,
        },
      },
    },
  });

  await prisma.masjidInvite.update({
    where: {
      id: invite.id,
    },
    data: {
      status: "accepted",
      joinDate: new Date(),
    },
  });
  
  return NextResponse.redirect(new URL(`/dashboard?masjidId=${updatedMasjid.id}`, request.url))
}