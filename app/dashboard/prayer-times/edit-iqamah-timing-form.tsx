"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Save, Loader2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { iqamahTimingSchema } from "@/lib/models/iqamah-timings"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock update function - replace with your actual API call
async function updateIqamahTiming(formData: FormData) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

type EditIqamahTimingFormProps = {
  timing: any
  onSuccess?: () => void
}

export function EditIqamahTimingForm({ timing, onSuccess }: EditIqamahTimingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof iqamahTimingSchema>>({
    resolver: zodResolver(iqamahTimingSchema),
    defaultValues: {
      ...timing,
      changeDate: new Date(timing.changeDate),
    },
  })

  async function onSubmit(values: z.infer<typeof iqamahTimingSchema>) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Append all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key === "changeDate") {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, value?.toString() || "")
        }
      })

      const result = await updateIqamahTiming(formData)

      if (result.success) {
        toast({
          title: "Iqamah timing updated",
          description: "Iqamah timing has been updated successfully.",
        })
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: "Failed to update Iqamah timing.",
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
    <div className="p-4">
      <h2 className="text-xl font-semibold text-[#550C18] mb-6">Edit Iqamah Timing</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="changeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Change Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal border-[#550C18]/20 focus:ring-[#550C18]"
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date when these Iqamah times will take effect</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="fajr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fajr</FormLabel>
                  <FormControl>
                    <Input placeholder="06:30 AM" className="border-[#550C18]/20 focus:ring-[#550C18]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dhuhr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dhuhr</FormLabel>
                  <FormControl>
                    <Input placeholder="02:00 PM" className="border-[#550C18]/20 focus:ring-[#550C18]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="asr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asr</FormLabel>
                  <FormControl>
                    <Input placeholder="06:45 PM" className="border-[#550C18]/20 focus:ring-[#550C18]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maghrib"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maghrib</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0 for sunset or specific time"
                      className="border-[#550C18]/20 focus:ring-[#550C18]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter 0 for "at sunset" or a specific time</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Isha</FormLabel>
                  <FormControl>
                    <Input placeholder="09:50 PM" className="border-[#550C18]/20 focus:ring-[#550C18]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t border-[#550C18]/10 pt-6">
            <h3 className="text-lg font-medium text-[#3A3A3A] mb-4">Jumuah Prayer Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="jumuahI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumuah I</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="02:10 PM"
                        className="border-[#550C18]/20 focus:ring-[#550C18]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jumuahII"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumuah II</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="03:00 PM"
                        className="border-[#550C18]/20 focus:ring-[#550C18]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jumuahIII"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumuah III (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        className="border-[#550C18]/20 focus:ring-[#550C18]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Iqamah Timing
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
