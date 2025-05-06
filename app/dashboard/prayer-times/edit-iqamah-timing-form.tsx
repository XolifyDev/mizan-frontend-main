"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { iqamahTimingSchema } from "@/lib/models/iqamah-timings"
import { updateIqamahTiming } from "@/lib/actions/prayer-times"
import { Input } from "@/components/ui/input"
import { TimeInput } from "@/components/ui/time-input"
import { MaghribInput } from "@/components/ui/maghrib-input"
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker"
import { toast } from "@/hooks/use-toast"

type EditIqamahTimingFormProps = {
  timing: any
  onSuccess?: () => void
}

export function EditIqamahTimingForm({ timing, onSuccess }: EditIqamahTimingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof iqamahTimingSchema>>({
    resolver: zodResolver(iqamahTimingSchema),
    defaultValues: {
      ...timing,
      changeDate: {
        from: new Date(timing.changeDate),
        to: new Date(timing.changeDate)
      },
    },
  })
  
  async function onSubmit(values: z.infer<typeof iqamahTimingSchema>) {
    setIsSubmitting(true)

    // Convert range to a single date string or the expected format
    try {
      const result = await updateIqamahTiming({
        ...values,
        id: timing.id,
      })

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
      <h2 className="text-xl font-semibold mb-6">Update Iqamah</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <FormLabel className="block mb-2">Iqamah Change Date</FormLabel>
              <FormField
                control={form.control}
                name="changeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CalendarDatePicker
                        date={{
                          to: field.value.to,
                          from: field.value.from
                        }}
                        onDateSelect={({ from, to }) => {
                          form.setValue("changeDate", { from, to });
                        }}
                        numberOfMonths={1}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel className="block mb-2">Fajr</FormLabel>
                <FormField
                  control={form.control}
                  name="fajr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2">Dhuhr</FormLabel>
                <FormField
                  control={form.control}
                  name="dhuhr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2">Asr</FormLabel>
                <FormField
                  control={form.control}
                  name="asr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2">Maghrib</FormLabel>
                <FormField
                  control={form.control}
                  name="maghrib"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MaghribInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2">Isha</FormLabel>
                <FormField
                  control={form.control}
                  name="isha"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-4">Jumuah Prayer Times</h3>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <FormLabel className="block mb-2">Jumuah I</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahI"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel className="block mb-2">Jumuah II</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahII"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel className="block mb-2">Jumuah III</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahIII"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onSuccess?.()}
              className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isSubmitting} onClick={() => {
              form.handleSubmit(onSubmit);
            }}>
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
