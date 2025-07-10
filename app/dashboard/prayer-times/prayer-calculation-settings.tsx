"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { prayerCalculationSchema } from "@/lib/models/iqamah-timings"
import { updatePrayerCalculationSettings } from "@/lib/actions/prayer-times"

type PrayerCalculationSettingsProps = {
  initialData: any
  masjidId: string
  onSuccess?: () => void
}

export function PrayerCalculationSettings({ initialData, masjidId, onSuccess }: PrayerCalculationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof prayerCalculationSchema>>({
    resolver: zodResolver(prayerCalculationSchema),
    defaultValues: {
      ...initialData,
      masjidId,
    },
  })

  async function onSubmit(values: z.infer<typeof prayerCalculationSchema>) {
    setIsSubmitting(true)
    try {
      delete values.updatedAt;
      const result = await updatePrayerCalculationSettings(values)
      console.log(result)

      if (result.success) {
        toast({
          title: "Settings updated",
          description: "Prayer calculation settings have been updated successfully.",
        })
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: "Failed to update prayer calculation settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="calculationMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calculation Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ISNA">ISNA (North America)</SelectItem>
                    <SelectItem value="MWL">Muslim World League</SelectItem>
                    <SelectItem value="Karachi">University of Islamic Sciences, Karachi</SelectItem>
                    <SelectItem value="Makkah">Umm al-Qura University, Makkah</SelectItem>
                    <SelectItem value="Egypt">Egyptian General Authority of Survey</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asrMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asr Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                      <SelectValue placeholder="Select Asr method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Standard">Standard (Shafi, Maliki, Hanbali)</SelectItem>
                    <SelectItem value="Hanafi">Hanafi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="higherLatitudeMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Higher Latitude Calculation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger className="border-[#550C18]/20 focus:ring-[#550C18]">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="MiddleOfNight">Middle of Night</SelectItem>
                    <SelectItem value="SeventhOfNight">Seventh of Night</SelectItem>
                    <SelectItem value="TwilightAngle">Twilight Angle</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="fajrOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fajr Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sunriseOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sunrise Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dhuhrOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dhuhr Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="asrOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asr Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maghribOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maghrib Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ishaOffset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Isha Offset</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="border-[#550C18]/20 focus:ring-[#550C18]"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>In minutes</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
