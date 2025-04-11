"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { iqamahTimingSchema, prayerCalculationSchema } from "../models/iqamah-timings"

// Mock database functions - replace with your actual database calls
async function savePrayerCalculationSettings(data: any) {
  // Save to your database
  console.log("Saving prayer calculation settings:", data)
  return { ...data, id: "calc-123" }
}

async function saveIqamahTiming(data: any) {
  // Save to your database
  console.log("Saving iqamah timing:", data)
  return { ...data, id: "iqamah-123" }
}

async function getIqamahTimings(masjidId: string) {
  // Fetch from your database
  // This is mock data
  return [
    {
      id: "iqamah-1",
      masjidId,
      changeDate: new Date("2025-04-11"),
      fajr: "06:30 AM",
      dhuhr: "02:00 PM",
      asr: "06:45 PM",
      maghrib: "0",
      isha: "09:50 PM",
      jumuahI: "02:10 PM",
      jumuahII: "03:00 PM",
      jumuahIII: null,
    },
    {
      id: "iqamah-2",
      masjidId,
      changeDate: new Date("2025-04-01"),
      fajr: "06:30 AM",
      dhuhr: "02:00 PM",
      asr: "06:45 PM",
      maghrib: "0",
      isha: "09:40 PM",
      jumuahI: "02:10 PM",
      jumuahII: "03:00 PM",
      jumuahIII: null,
    },
    {
      id: "iqamah-3",
      masjidId,
      changeDate: new Date("2025-03-31"),
      fajr: "06:45 AM",
      dhuhr: "02:00 PM",
      asr: "06:45 PM",
      maghrib: "0",
      isha: "09:50 PM",
      jumuahI: "02:10 PM",
      jumuahII: "03:00 PM",
      jumuahIII: null,
    },
  ]
}

async function getPrayerCalculationSettings(masjidId: string) {
  // Fetch from your database
  // This is mock data
  return {
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
  }
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
    const result = await savePrayerCalculationSettings(validatedData)
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
    const result = await saveIqamahTiming(validatedData)
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
    return { success: false, error: "Failed to fetch Iqamah timings" }
  }
}

export async function fetchPrayerCalculationSettings(masjidId: string) {
  try {
    const settings = await getPrayerCalculationSettings(masjidId)
    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: "Failed to fetch prayer calculation settings" }
  }
}
