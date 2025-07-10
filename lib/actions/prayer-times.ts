"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { iqamahTimingSchema, iqamahTimingSchemaAPI, prayerCalculationSchema } from "../models/iqamah-timings"
import { prisma } from "../db"
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan"
import moment from "moment";


async function savePrayerCalculationSettings(data: any, masjidId: string) {
  const update = await prisma.prayerCalculation.findFirst({
    where: {
      masjidId,
    },
  })

  if (!update) {
    const prayerCalculation = await prisma.prayerCalculation.create({
      data: {
        ...data,
        masjidId,
      },
    })
    return prayerCalculation
  } else {
    const prayerCalculation = await prisma.prayerCalculation.update({
      where: {
        id: update.id,
      },
      data: data,
    })
    return prayerCalculation
  }
}

async function saveIqamahTiming(data: any, masjidId: string) {
  console.log(data, "DATA");
  const iqamahTiming = await prisma.iqamahTiming.create({
    data: {
      ...data,
      masjidId,
    },
  })
  console.log(iqamahTiming, "TIMING");
  return iqamahTiming
}

async function getIqamahTimings(masjidId: string) {
  const iqamahTimings = await prisma.iqamahTiming.findMany({
    where: {
      masjidId,
    },
    orderBy: {
      changeDate: "desc"
    },
  })
  return iqamahTimings
}

export async function getPrayerTimings(masjidId: string) {
  const prayerTimings = await prisma.prayerTime.findMany({
    where: {
      masjidId,
    },
    orderBy: {
      date: "asc"
    }
  })
  return prayerTimings
}

async function getPrayerCalculationSettings(masjidId: string) {
  const prayerCalculation = await prisma.prayerCalculation.findFirst({
    where: {
      masjidId,
    },
  })
  return (
    prayerCalculation || {
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
  )
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

export async function addIqamahTiming(rawData: z.infer<typeof iqamahTimingSchema>) {
  const data = {
    ...rawData,
    masjidId: rawData.masjidId as string,
    maghribOffset: String(rawData.maghribOffset),
    changeDate: new Date(rawData.changeDate.to),
  };
  try {
    const validatedData = iqamahTimingSchemaAPI.parse(data)
    const result = await saveIqamahTiming(validatedData, validatedData.masjidId)
    console.log(result, "INSERT RESULT");
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

export async function fetchPrayerTimings(masjidId: string) {
  try {
    const timings = await getPrayerTimings(masjidId)
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
      return CalculationMethod.NorthAmerica()
    case "MWL":
      return CalculationMethod.MuslimWorldLeague()
    case "Karachi":
      return CalculationMethod.Karachi()
    case "Makkah":
      return CalculationMethod.UmmAlQura()
    case "Egypt":
      return CalculationMethod.Egyptian()
    default:
      return CalculationMethod.NorthAmerica()
  }
}

// Function to get the Madhab (Asr calculation method)
function getMadhab(asrMethod: string) {
  return asrMethod === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi
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
  }

  return adjustedTimes
}

// Format time as HH:MM AM/PM
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Returns the most recent iqamah timing for a given masjid and date
export async function getIqamahTimingForDate(masjidId: string, date: Date) {
  const timings = await prisma.iqamahTiming.findMany({
    where: { 
      masjidId, 
      changeDate: { lte: date } 
    },
    orderBy: { changeDate: "desc" },
    take: 1,
  });
  return timings[0] || null;
}

// Get today's iqamah timing for a masjid
export async function getTodayIqamahTiming(masjidId: string) {
  return await getIqamahTimingForDate(masjidId, new Date());
}

// Generate prayer times for a specific month and year
export async function generateMonthlyPrayerTimes(
  masjidId: string,
  month: number,
  year: number,
  latitude: number,
  longitude: number,
) {
  try {
    // Get prayer calculation settings
    const settings = await getPrayerCalculationSettings(masjidId)

    // Create coordinates
    const coordinates = new Coordinates(latitude, longitude)

    // Get calculation method based on settings
    const calculationMethod = getCalculationMethod(settings.calculationMethod)

    // Set madhab for Asr calculation
    calculationMethod.madhab = getMadhab(settings.asrMethod)

    // Create offsets object
    const offsets = {
      fajrOffset: settings.fajrOffset,
      sunriseOffset: settings.sunriseOffset,
      dhuhrOffset: settings.dhuhrOffset,
      asrOffset: settings.asrOffset,
      maghribOffset: settings.maghribOffset,
      ishaOffset: settings.ishaOffset,
    }

    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate()

    // Generate prayer times for each day of the month
    const monthlyTimes = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const prayerTimes = new PrayerTimes(coordinates, date, calculationMethod)
      const adjustedTimes = applyOffsets(prayerTimes, offsets)

      // Fetch iqamah timing for this date
      const iqamahTiming = await getIqamahTimingForDate(masjidId, date)

      monthlyTimes.push({
        date: date.toISOString().split("T")[0],
        fajr: formatTime(adjustedTimes.fajr),
        sunrise: formatTime(adjustedTimes.sunrise),
        dhuhr: formatTime(adjustedTimes.dhuhr),
        asr: formatTime(adjustedTimes.asr),
        maghrib: formatTime(adjustedTimes.maghrib),
        isha: formatTime(adjustedTimes.isha),
        iqamah: iqamahTiming
          ? {
              fajr: iqamahTiming.fajr && iqamahTiming.fajr instanceof Date && !isNaN(iqamahTiming.fajr.getTime()) ? formatTime(iqamahTiming.fajr) : null,
              dhuhr: iqamahTiming.dhuhr && iqamahTiming.dhuhr instanceof Date && !isNaN(iqamahTiming.dhuhr.getTime()) ? formatTime(iqamahTiming.dhuhr) : null,
              asr: iqamahTiming.asr && iqamahTiming.asr instanceof Date && !isNaN(iqamahTiming.asr.getTime()) ? formatTime(iqamahTiming.asr) : null,
              maghrib: iqamahTiming.maghrib && iqamahTiming.maghrib instanceof Date && !isNaN(iqamahTiming.maghrib.getTime()) ? formatTime(iqamahTiming.maghrib) : null,
              isha: iqamahTiming.isha && iqamahTiming.isha instanceof Date && !isNaN(iqamahTiming.isha.getTime()) ? formatTime(iqamahTiming.isha) : null,
              jumuahI: iqamahTiming.jumuahI && iqamahTiming.jumuahI instanceof Date && !isNaN(iqamahTiming.jumuahI.getTime()) ? formatTime(iqamahTiming.jumuahI) : null,
              jumuahII: iqamahTiming.jumuahII && iqamahTiming.jumuahII instanceof Date && !isNaN(iqamahTiming.jumuahII.getTime()) ? formatTime(iqamahTiming.jumuahII) : null,
              jumuahIII: iqamahTiming.jumuahIII && iqamahTiming.jumuahIII instanceof Date && !isNaN(iqamahTiming.jumuahIII.getTime()) ? formatTime(iqamahTiming.jumuahIII) : null,
            }
          : null,
      })
    }

    return { success: true, data: monthlyTimes }
  } catch (error) {
    console.error("Error generating monthly prayer times:", error)
    return { success: false, error: "Failed to generate monthly prayer times" }
  }
}

// Save generated prayer times to database
export async function saveMonthlyPrayerTimes(masjidId: string, prayerTimes: any[]) {
  try {
    // First delete existing prayer times for this month to avoid duplicates
    const firstDate = new Date(prayerTimes[0].date)
    const lastDate = new Date(prayerTimes[prayerTimes.length - 1].date)

    await prisma.prayerTime.deleteMany({
      where: {
        masjidId,
        date: {
          gte: firstDate,
          lte: lastDate,
        },
      },
    })

    // Now insert the new prayer times
    const createdTimes = await Promise.all(
      prayerTimes.map(async (pt) => {
        const date = new Date(pt.date)

        // Parse time strings to Date objects
        const parseTimeString = (timeStr: string, baseDate: Date) => {
          if (!timeStr || timeStr.trim() === "" || timeStr === "Invalid Date") {
            throw new Error(`Invalid time string: ${timeStr}`);
          }
          
          const [time, period] = timeStr.split(" ")
          if (!time || !period) {
            throw new Error(`Invalid time format: ${timeStr}`);
          }
          
          const [hours, minutes] = time.split(":").map(Number)
          if (isNaN(hours) || isNaN(minutes)) {
            throw new Error(`Invalid time values: ${timeStr}`);
          }

          let hour = hours
          if (period === "PM" && hours < 12) hour += 12
          if (period === "AM" && hours === 12) hour = 0

          const newDate = new Date(baseDate)
          newDate.setHours(hour, minutes, 0, 0)
          return newDate
        }

        // Parse iqamah times if available
        const parseIqamahTime = (timeStr: string | null) => {
          if (!timeStr || timeStr.trim() === "" || timeStr === "Invalid Date") return null;
          try {
            return parseTimeString(timeStr, date);
          } catch (error) {
            console.warn(`Invalid iqamah time format: ${timeStr}`);
            return null;
          }
        };

        // Validate and parse prayer times
        const parsePrayerTime = (timeStr: string) => {
          try {
            return parseTimeString(timeStr, date);
          } catch (error) {
            console.warn(`Invalid prayer time format: ${timeStr} for date ${pt.date}`);
            throw new Error(`Invalid prayer time: ${timeStr}`);
          }
        };

        return prisma.prayerTime.create({
          data: {
            masjidId,
            date,
            fajr: parsePrayerTime(pt.fajr),
            dhuhr: parsePrayerTime(pt.dhuhr),
            asr: parsePrayerTime(pt.asr),
            maghrib: parsePrayerTime(pt.maghrib),
            isha: parsePrayerTime(pt.isha),
            sunrise: parsePrayerTime(pt.sunrise),
            month: String(date.getMonth()),
            year: date.getFullYear(),
            // Add iqamah times if available
            ...(pt.iqamah && {
              iqamahFajr: parseIqamahTime(pt.iqamah.fajr),
              iqamahDhuhr: parseIqamahTime(pt.iqamah.dhuhr),
              iqamahAsr: parseIqamahTime(pt.iqamah.asr),
              iqamahMaghrib: parseIqamahTime(pt.iqamah.maghrib),
              iqamahIsha: parseIqamahTime(pt.iqamah.isha),
              iqamahJumuahI: parseIqamahTime(pt.iqamah.jumuahI),
              iqamahJumuahII: parseIqamahTime(pt.iqamah.jumuahII),
              iqamahJumuahIII: parseIqamahTime(pt.iqamah.jumuahIII),
            }),
          },
        })
      }),
    )

    return { success: true, data: createdTimes }
  } catch (error) {
    console.error("Error saving monthly prayer times:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to save monthly prayer times"
    return { success: false, error: errorMessage }
  }
}

export async function getMonthPrayerTimes({
  month,
  year,
  masjidId
}: {
    month: number;
    year: number;
    masjidId: string;
}) {
  const prayerTimes = await prisma.prayerTime.findMany({
    where: {
      masjidId,
      month: String(month),
      year
    },
    orderBy: {
      date: "asc"
    }
  });

  return prayerTimes || [];
}

export async function fetchMonthPrayerTimes(masjidId: string, month: number, year: number) {
  try {
    const timings = await getMonthPrayerTimes({month, year, masjidId})
    return { success: true, data: timings }
  } catch (error) {
    return { success: false, error: JSON.stringify(error) }
  }
}

export async function updatePrayerTime(
  prayerTimeId: string,
  prayer: string,
  time: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const timing = await prisma.prayerTime.findFirst({
      where: {
        id: prayerTimeId
      }
    });
    if (!timing) {
      return { success: false, error: "Prayer time not found" };
    }

    const baseDate = moment(timing.date);
    const parsedTime = moment(time, ["h:mm A"]);

    if (!parsedTime.isValid()) {
      return { success: false, error: "Invalid time format" };
    }

    baseDate.set("hour", parsedTime.hour());
    baseDate.set("minute", parsedTime.minute());

    const update = await prisma.prayerTime.update({
      where: { id: prayerTimeId },
      data: { [prayer]: baseDate.toDate() }
    });
    return { success: true }
  } catch (error) {
    console.error("Error updating prayer time:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update prayer time",
    }
  }
}

export async function updateIqamahTiming(rawData: z.infer<typeof iqamahTimingSchema>) {
  const id = rawData.id as string
  const data = {
    ...rawData,
    masjidId: rawData.masjidId as string,
    changeDate: new Date(rawData.changeDate.to),
  }
  try {
    const validatedData = iqamahTimingSchemaAPI.parse(data)
    const result = await prisma.iqamahTiming.update({
      where: {
        id: id,
      },
      data: {
        changeDate: validatedData.changeDate,
        fajr: validatedData.fajr,
        dhuhr: validatedData.dhuhr,
        asr: validatedData.asr,
        maghrib: validatedData.maghrib,
        isha: validatedData.isha,
        jumuahI: validatedData.jumuahI,
        jumuahII: validatedData.jumuahII,
        jumuahIII: validatedData.jumuahIII,
      },
    })

    revalidatePath("/dashboard/prayer-times")
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update Iqamah timing" }
  }
}

// Add these functions to your existing prayer-times.ts file

export async function deleteIqamahTiming(id: string) {
  try {
    await prisma.iqamahTiming.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/prayer-times")
    return { success: true }
  } catch (error) {
    console.error("Error deleting Iqamah timing:", error)
    return { success: false, error: "Failed to delete Iqamah timing" }
  }
}

export async function duplicateIqamahTiming(id: string) {
  try {
    // Get the original timing
    const original = await prisma.iqamahTiming.findUnique({
      where: {
        id,
      },
    })

    if (!original) {
      return { success: false, error: "Iqamah timing not found" }
    }

    // Create a new timing with the same values but a new ID
    const { id: _, createdAt, updatedAt, ...timingData } = original

    // Set the change date to tomorrow
    const tomorrow = new Date(original.changeDate)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const duplicated = await prisma.iqamahTiming.create({
      data: {
        ...timingData,
        changeDate: tomorrow,
      },
    })

    revalidatePath("/dashboard/prayer-times")
    return { success: true, data: duplicated }
  } catch (error) {
    console.error("Error duplicating Iqamah timing:", error)
    return { success: false, error: "Failed to duplicate Iqamah timing" }
  }
}

// Bulk create iqamah timings for a date range
export async function bulkCreateIqamahTimings(
  masjidId: string,
  startDate: Date,
  endDate: Date,
  iqamahData: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    maghribType: string;
    maghribOffset: string;
    isha: string;
    jumuahI?: string;
    jumuahII?: string;
    jumuahIII?: string;
  },
  changeDates: Date[] = [] // Array of specific dates when iqamah should change
) {
  try {
    // If no specific change dates provided, create one for the start date
    const datesToCreate = changeDates.length > 0 ? changeDates : [startDate];
    
    // Delete any existing iqamah timings in the date range
    await prisma.iqamahTiming.deleteMany({
      where: {
        masjidId,
        changeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Create iqamah timing for each change date
    const createdTimings = await Promise.all(
      datesToCreate.map(async (changeDate) => {
        return await prisma.iqamahTiming.create({
          data: {
            masjidId,
            changeDate,
            ...iqamahData,
          },
        });
      })
    );

    revalidatePath("/dashboard/prayer-times");
    return { success: true, data: createdTimings };
  } catch (error) {
    console.error("Error bulk creating iqamah timings:", error);
    return { success: false, error: "Failed to bulk create iqamah timings" };
  }
}

// Get iqamah timing schedule for a date range
export async function getIqamahTimingSchedule(masjidId: string, startDate: Date, endDate: Date) {
  try {
    const timings = await prisma.iqamahTiming.findMany({
      where: {
        masjidId,
        changeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        changeDate: "asc",
      },
    })
    return { success: true, data: timings }
  } catch (error) {
    console.error("Error fetching iqamah timing schedule:", error)
    return { success: false, error: "Failed to fetch iqamah timing schedule" }
  }
}
