"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { iqamahTimingSchema, prayerCalculationSchema } from "../models/iqamah-timings"
import { prisma } from "../db"

async function savePrayerCalculationSettings(data: any, masjidId: string) {
  const update = await prisma.prayerCalculation.findFirst({
    where: {
      masjidId
    }
  });

  if(!update) {
    const prayerCalculation = await prisma.prayerCalculation.create({
      data: {
        ...data,
        masjidId
      }
    });
    return prayerCalculation;
  } else {
    const prayerCalculation = await prisma.prayerCalculation.update({
      where: {
        id: update.id
      },
      data: data
    });
    return prayerCalculation;
  };
}

async function saveIqamahTiming(data: any, masjidId: string) {
  const iqamahTiming = await prisma.iqamahTiming.create({
    data: {
      ...data,
      masjidId
    }
  });
  return iqamahTiming;
}

async function getIqamahTimings(masjidId: string) {
  const iqamahTimings = await prisma.iqamahTiming.findMany({
    where: {
      masjidId
    }
  });
  return iqamahTimings;
}

async function getPrayerCalculationSettings(masjidId: string) {
  const prayerCalculation = await prisma.prayerCalculation.findFirst({
    where: {
      masjidId
    }
  })
  return prayerCalculation || {
    id: "calc-1",
    masjidId,
    calculationMethod: "ISNA",
    asrMethod: "Standard",
    higherLatitudeMethod: "None",
    fajrOffset: 0,
    sunriseOffset: 0,
    dhuhrOffset: 0,
    asrOffset: 0,
    maghribOffset: 0,
    ishaOffset: 0,
  };
}

export async function updatePrayerCalculationSettings(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())

  // Convert string numbers to actual numbers
  const data = {
    ...rawData,
    masjidId: rawData.masjidId as string,
    fajrOffset: Number.parseInt(rawData.fajrOffset as string),
    sunriseOffset: Number.parseInt(rawData.sunriseOffset as string),
    dhuhrOffset: Number.parseInt(rawData.dhuhrOffset as string),
    asrOffset: Number.parseInt(rawData.asrOffset as string),
    maghribOffset: Number.parseInt(rawData.maghribOffset as string),
    ishaOffset: Number.parseInt(rawData.ishaOffset as string),
  }

  try {
    const validatedData = prayerCalculationSchema.parse(data)
    const result = await savePrayerCalculationSettings(validatedData, validatedData.masjidId)
    revalidatePath("/dashboard/prayer-times")
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update prayer calculation settings" }
  }
}

export async function addIqamahTiming(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())

  const data = {
    ...rawData,
    masjidId: rawData.masjidId as string,
    changeDate: new Date(rawData.changeDate as string),
  }

  try {
    const validatedData = iqamahTimingSchema.parse(data)
    const result = await saveIqamahTiming(validatedData, validatedData.masjidId)
    revalidatePath("/dashboard/prayer-times")
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to add Iqamah timing" }
  }
}

export async function fetchIqamahTimings(masjidId: string) {
  try {
    const timings = await getIqamahTimings(masjidId)
    return { success: true, data: timings }
  } catch (error) {
    return { success: false, error: JSON.stringify(error) }
  }
}

export async function fetchPrayerCalculationSettings(masjidId: string) {
  try {
    const settings = await getPrayerCalculationSettings(masjidId)
    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: JSON.stringify(error) }
  }
}
