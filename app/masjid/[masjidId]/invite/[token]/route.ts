"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ masjidId: string; token: string }> }) {
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

  // Scope the lookup to this masjid AND this user: a token alone must not be
  // enough to join, or anyone holding a link could accept someone else's
  // invite, at a masjid the invite was never issued for.
  const invite = await prisma.masjidInvite.findFirst({
    where: {
      token: token,
      masjidId: masjidId,
      userId: session.user.id,
    },
  });

  if (!invite) {
    return NextResponse.redirect(new URL(`/error?message=Invalid invite`, request.url))
  }

  // Single use — an accepted or declined invite must not be replayable.
  if (invite.status !== "pending") {
    return NextResponse.redirect(new URL(`/error?message=Invite has already been used`, request.url))
  }

  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL(`/error?message=Invite has expired`, request.url))
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

  // Membership row carries the role the inviter chose.
  await prisma.masjidMember.upsert({
    where: {
      masjidId_userId: { masjidId, userId: session.user.id },
    },
    create: {
      masjidId,
      userId: session.user.id,
      role: invite.role,
    },
    update: { role: invite.role },
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