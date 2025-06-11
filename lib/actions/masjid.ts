"use server";

import { z } from "zod"
import { v4 } from "uuid"
import { getUser } from "./user"
import { prisma } from "@/lib/db"
import { sendMasjidInvite } from "./email";
import { auth } from "../auth";

// Update the CreateMasjidFormSchema to include latitude and longitude
const CreateMasjidFormSchema = z.object({
  name: z.string().min(2, {
    message: "Masjid name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().min(2, {
    message: "State is required.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  description: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

// Update the createMasjid function to accept latitude and longitude
export async function createMasjid({
  name,
  description,
  address,
  city,
  state,
  zipCode,
  country,
  latitude,
  longitude,
}: z.infer<typeof CreateMasjidFormSchema>) {
  const user = await getUser()
  if (!user)
    return {
      error: true,
      message: "Please Login!",
    }
  const masjid = await prisma.masjid.create({
    data: {
      city,
      country,
      name,
      address,
      postal: zipCode,
      id: `m_${v4()}`,
      email: "",
      latitude: String(latitude) || "",
      locationAddress: "",
      longitude: String(longitude) || "",
      phone: "",
      timezone: "",
      websiteUrl: "",
      description: description || "",
      ownerId: user.id,
      users: {
        connect: {
          id: user.id
        }
      }
    },
  })

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      masjids: {
        connect: {
          id: masjid.id
        }
      },
    }
  });

  return {
    error: false,
    message: "Masjid Created!",
  }
}

export async function getUserMasjid(masjidId: string) {
  const user = await getUser();
  if(!user) return {
    error: true,
    message: "Please Login!"
  };
  const masjid = await prisma.masjid.findFirst({
    where: {
      id: masjidId && masjidId.length < 1 ? undefined : masjidId,
      users: {
        some: {
          id: user.id
        }
      }
    }
  });

  return masjid || null;
}

export async function inviteUserToMasjid(masjidId: string, userId: string, invitedById: string) {
  const masjid = await prisma.masjid.findFirst({
    where: {
      id: masjidId
    }
  });
  if (!masjid) return {
    error: true,
    message: "Masjid not found!"
  };
  const invitedTo = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });
  if (!invitedTo) return {
    error: true,
    message: "User not found!"
  };
  const invitedBy = await prisma.user.findFirst({
    where: {
      id: invitedById
    }
  });
  if (!invitedBy) return {
    error: true,
    message: "Invited by user not found!"
  };

  const invite = await prisma.masjidInvite.create({
    data: {
      masjidId,
      userId,
      invitedById,
      status: "pending",
      token: v4(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
  });
  await sendMasjidInvite({
    to: invitedTo.email,
    userName: invitedTo.name,
    masjidName: masjid.name,
    inviteLink: `${process.env.DOMAIN}/masjid/${masjid.id}/invite/${invite.token}`,
    inviterName: invitedBy.name,
    supportEmail: process.env.SUPPORT_EMAIL,
    token: invite.token,
  });
  return {
    error: false,
    message: "User invited successfully!",
  }
}

export async function getPendingInvites(masjidId: string) {
  const invites = await prisma.masjidInvite.findMany({
    where: {
      masjidId,
      status: "pending",
    },
    include: {
      invitedBy: true,
    }
  });
  return invites;
}

export async function declineMasjidInvite(inviteId: string) {
  await prisma.masjidInvite.update({
    where: {
      id: inviteId
    },
    data: {
      status: "cancelled"
    }
  });
  return {
    error: false,
    message: "Invite declined successfully!",
  }
}

export async function removeUserFromMasjid(masjidId: string, userId: string) {
  const session = await getUser();
  if (!session) return {
    error: true,
    message: "Please Login!"
  };
  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });
  if (!user) return {
    error: true,
    message: "User not found!"
  };
  const masjid = await prisma.masjid.findFirst({
    where: {
      id: masjidId
    }
  });
  if (!masjid) return {
    error: true,
    message: "Masjid not found!"
  };
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      masjids: {
        disconnect: {
          id: masjidId
        }
      }
    }
  });
  await prisma.masjidInvite.deleteMany({
    where: {
      userId,
      masjidId
    }
  });
  return {
    error: false,
    message: "User removed from masjid successfully!",
  }
}

