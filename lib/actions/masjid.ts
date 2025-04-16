"use server";

import { z } from "zod"
import { v4 } from "uuid"
import { getUser } from "./user"
import { prisma } from "@/lib/db"

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
    },
  })

  return {
    error: false,
    message: "Masjid Created!",
  }
}

export async function getUserMasjid() {
  const user = await getUser();
  if(!user) return {
    error: true,
    message: "Please Login!"
  };
  const masjid = await prisma.masjid.findFirst({
    where: {
      ownerId: user.id
    }
  });

  return masjid || null;
}
