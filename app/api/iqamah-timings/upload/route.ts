import { type NextRequest, NextResponse } from "next/server"
import { parse } from "papaparse"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

// CSV validation schema
const csvRowSchema = z.object({
  changeDate: z.string().refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    },
    { message: "Invalid date format" },
  ),
  fajr: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^0$/, {
    message: "Time must be in format HH:MM AM/PM or 0 for Maghrib offset",
  }),
  dhuhr: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, {
    message: "Time must be in format HH:MM AM/PM",
  }),
  asr: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, {
    message: "Time must be in format HH:MM AM/PM",
  }),
  maghrib: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^0$/, {
    message: "Time must be in format HH:MM AM/PM or 0 for sunset",
  }),
  isha: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, {
    message: "Time must be in format HH:MM AM/PM",
  }),
  jumuahI: z
    .string()
    .regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^$/, {
      message: "Time must be in format HH:MM AM/PM or empty",
    })
    .optional(),
  jumuahII: z
    .string()
    .regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^$/, {
      message: "Time must be in format HH:MM AM/PM or empty",
    })
    .optional(),
  jumuahIII: z
    .string()
    .regex(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^$/, {
      message: "Time must be in format HH:MM AM/PM or empty",
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const masjidId = formData.get("masjidId") as string

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (!masjidId) {
      return NextResponse.json({ success: false, error: "Masjid ID is required" }, { status: 400 })
    }

    // Check if the file is a CSV
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json({ success: false, error: "File must be a CSV" }, { status: 400 })
    }

    // Read the file content
    const text = await file.text()

    // Parse CSV
    const { data, errors } = parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: "Error parsing CSV", details: errors }, { status: 400 })
    }

    // Validate and transform data
    const validationResults = data.map((row: any, index: number) => {
      try {
        const validatedRow = csvRowSchema.parse(row)
        return {
          success: true,
          data: {
            ...validatedRow,
            changeDate: new Date(validatedRow.changeDate),
            masjidId,
          },
          rowIndex: index,
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: error.errors,
            rowIndex: index,
          }
        }
        return {
          success: false,
          error: "Unknown validation error",
          rowIndex: index,
        }
      }
    })

    // Check if there are any validation errors
    const validationErrors = validationResults.filter((result: any) => !result.success)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation errors in CSV data",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Insert valid data into the database
    const validData = validationResults.filter((result: any) => result.success).map((result: any) => result.data)

    const result = await prisma.iqamahTiming.createMany({
      data: validData,
      skipDuplicates: true,
    })

    // Revalidate the prayer times page
    revalidatePath("/dashboard/prayer-times")

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.count} Iqamah timings`,
      count: result.count,
    })
  } catch (error) {
    console.error("Error uploading Iqamah timings:", error)
    return NextResponse.json({ success: false, error: "Failed to process CSV upload" }, { status: 500 })
  }
}
