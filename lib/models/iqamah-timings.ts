import { z } from "zod"

// Schema for Iqamah timing entry
export const iqamahTimingSchema = z.object({
  id: z.string().optional(),
  masjidId: z.string(),
  changeDate: z.object({
    from: z.date(),
    to: z.date(),
  }),
  fajr: z.string(), // Time format: "HH:MM AM/PM" or "HH:MM" (24h)
  dhuhr: z.string(),
  asr: z.string(),
  maghrib: z.string(),
  isha: z.string(),
  jumuahI: z.string().optional(),
  jumuahII: z.string().optional(),
  jumuahIII: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const iqamahTimingSchemaAPI = z.object({
  id: z.string().optional(),
  masjidId: z.string(),
  changeDate: z.date(),
  fajr: z.string(), // Time format: "HH:MM AM/PM" or "HH:MM" (24h)
  dhuhr: z.string(),
  asr: z.string(),
  maghrib: z.string(),
  isha: z.string(),
  jumuahI: z.string().optional(),
  jumuahII: z.string().optional(),
  jumuahIII: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Schema for prayer time calculation settings
export const prayerCalculationSchema = z.object({
  id: z.string().optional(),
  masjidId: z.string(),
  calculationMethod: z.enum(["ISNA", "MWL", "Karachi", "Makkah", "Egypt", "Custom"]),
  asrMethod: z.enum(["Standard", "Hanafi"]),
  higherLatitudeMethod: z.enum(["None", "MiddleOfNight", "SeventhOfNight", "TwilightAngle"]),
  fajrOffset: z.number().int(),
  sunriseOffset: z.number().int(),
  dhuhrOffset: z.number().int(),
  asrOffset: z.number().int(),
  maghribOffset: z.number().int(),
  ishaOffset: z.number().int(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type IqamahTiming = z.infer<typeof iqamahTimingSchema>
export type PrayerCalculation = z.infer<typeof prayerCalculationSchema>
