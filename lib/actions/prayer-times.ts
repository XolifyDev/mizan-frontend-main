"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { iqamahTimingSchema, prayerCalculationSchema } from "../models/iqamah-timings"
import { prisma } from "../db"
// Import Adhan.js for prayer time calculations
import { CalculationMethod, Coordinates, Madhab, PrayerTimes, SunnahTimes } from "adhan"

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

export async function updatePrayerCalculationSettings(data: z.infer<typeof prayerCalculationSchema>) {
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

function getCalculationMethod(methodName: string) {
  switch (methodName) {
    case "ISNA":
      return CalculationMethod.NorthAmerica();
    case "MWL":
      return CalculationMethod.MuslimWorldLeague();
    case "Karachi":
      return CalculationMethod.Karachi();
    case "Makkah":
      return CalculationMethod.UmmAlQura();
    case "Egypt":
      return CalculationMethod.Egypt();
    default:
      return CalculationMethod.NorthAmerica();
  }
}

// Function to get the Madhab (Asr calculation method)
function getMadhab(asrMethod: string) {
  return asrMethod === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
}

// Function to apply offsets to prayer times
function applyOffsets(prayerTimes: PrayerTimes, offsets: Record<string, number>) {
  const adjustedTimes = {
    fajr: new Date(prayerTimes.fajr.getTime() + offsets.fajrOffset * 60 * 1000),
    sunrise: new Date(prayerTimes.sunrise.getTime() + offsets.sunriseOffset * 60 * 1000),
    dhuhr: new Date(prayerTimes.dhuhr.getTime() + offsets.dhuhrOffset * 60 * 1000),
    asr: new Date(prayerTimes.asr.getTime() + offsets.asrOffset * 60 * 1000),
    maghrib: new Date(prayerTimes.maghrib.getTime() + offsets.maghribOffset * 60 * 1000),
    isha: new Date(prayerTimes.isha.getTime() + offsets.ishaOffset * 60 * 1000),
  };
  
  return adjustedTimes;
}

// Format time as HH:MM AM/PM
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

// Generate prayer times for a specific month and year
export async function generateMonthlyPrayerTimes(
  masjidId: string, 
  month: number, 
  year: number,
  latitude: number,
  longitude: number
) {
  try {
    // Get prayer calculation settings
    const settings = await getPrayerCalculationSettings(masjidId);
    
    // Create coordinates
    const coordinates = new Coordinates(latitude, longitude);
    
    // Get calculation method based on settings
    const calculationMethod = getCalculationMethod(settings.calculationMethod);
    
    // Set madhab for Asr calculation
    calculationMethod.madhab = getMadhab(settings.asrMethod);
    
    // Create offsets object
    const offsets = {
      fajrOffset: settings.fajrOffset,
      sunriseOffset: settings.sunriseOffset,
      dhuhrOffset: settings.dhuhrOffset,
      asrOffset: settings.asrOffset,
      maghribOffset: settings.maghribOffset,
      ishaOffset: settings.ishaOffset,
    };
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Generate prayer times for each day of the month
    const monthlyTimes = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const prayerTimes = new PrayerTimes(coordinates, date, calculationMethod);
      const adjustedTimes = applyOffsets(prayerTimes, offsets);
      
      monthlyTimes.push({
        date: date.toISOString().split('T')[0],
        fajr: formatTime(adjustedTimes.fajr),
        sunrise: formatTime(adjustedTimes.sunrise),
        dhuhr: formatTime(adjustedTimes.dhuhr),
        asr: formatTime(adjustedTimes.asr),
        maghrib: formatTime(adjustedTimes.maghrib),
        isha: formatTime(adjustedTimes.isha),
      });
    }
    
    return { success: true, data: monthlyTimes };
  } catch (error) {
    console.error("Error generating monthly prayer times:", error);
    return { success: false, error: "Failed to generate monthly prayer times" };
  }
}

// Save generated prayer times to database
export async function saveMonthlyPrayerTimes(masjidId: string, prayerTimes: any[]) {
  try {
    // First delete existing prayer times for this month to avoid duplicates
    const firstDate = new Date(prayerTimes[0].date);
    const lastDate = new Date(prayerTimes[prayerTimes.length - 1].date);
    
    await prisma.prayerTime.deleteMany({
      where: {
        masjidId,
        date: {
          gte: firstDate,
          lte: lastDate
        }
      }
    });
    
    // Now insert the new prayer times
    const createdTimes = await Promise.all(
      prayerTimes.map(async (pt) => {
        const date = new Date(pt.date);
        
        // Parse time strings to Date objects
        const parseTimeString = (timeStr: string, baseDate: Date) => {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          
          let hour = hours;
          if (period === 'PM' && hours < 12) hour += 12;
          if (period === 'AM' && hours === 12) hour = 0;
          
          const newDate = new Date(baseDate);
          newDate.setHours(hour, minutes, 0, 0);
          return newDate;
        };
        
        return prisma.prayerTime.create({
          data: {
            masjidId,
            date,
            fajr: parseTimeString(pt.fajr, date),
            dhuhr: parseTimeString(pt.dhuhr, date),
            asr: parseTimeString(pt.asr, date),
            maghrib: parseTimeString(pt.maghrib, date),
            isha: parseTimeString(pt.isha, date),
            sunrise: parseTimeString(pt.sunrise, date)
          }
        });
      })
    );
    
    return { success: true, data: createdTimes };
  } catch (error) {
    console.error("Error saving monthly prayer times:", error);
    return { success: false, error: "Failed to save monthly prayer times" };
  }
}
