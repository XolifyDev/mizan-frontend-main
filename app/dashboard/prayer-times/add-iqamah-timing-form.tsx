"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { iqamahTimingSchema } from "@/lib/models/iqamah-timings"
import { addIqamahTiming } from "@/lib/actions/prayer-times"
import { TimeInput } from "@/components/ui/time-input"
import { MaghribInput } from "@/components/ui/maghrib-input"
import { DatePicker } from "@/components/ui/date-picker"
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker"
import { IqamahTiming } from "@prisma/client"
import { Input } from "@/components/ui/input"

type AddIqamahTimingFormProps = {
  masjidId: string;
  lastIqamah: IqamahTiming | null;
  onSuccess?: () => void
}

export function AddIqamahTimingForm({ masjidId, lastIqamah, onSuccess }: AddIqamahTimingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof iqamahTimingSchema>>({
    resolver: zodResolver(iqamahTimingSchema),
    defaultValues: {
      masjidId,
      changeDate: {
        from: new Date(),
        to: new Date()
      },
      fajr: lastIqamah?.fajr || "",
      dhuhr: lastIqamah?.dhuhr || "",
      asr: lastIqamah?.asr || "",
      maghrib: lastIqamah?.maghrib || "0", // Default to 0 for "at sunset"
      maghribOffset: Number(lastIqamah?.maghribOffset) || 0,
      maghribType: lastIqamah?.maghribType || "Offset",
      isha: lastIqamah?.isha || "",
      jumuahI: lastIqamah?.jumuahI || "",
      jumuahII: lastIqamah?.jumuahII || "",
      jumuahIII: lastIqamah?.jumuahIII || "",
    },
  })

  function formatTime(time: string): string {
    if (!time) return "";

    // Match common time formats like HH:MM or HH:MM am/pm
    const match = time.match(/^(\d{1,2}):(\d{1,2})(\s?[aApP][mM])?$/);

    if (!match) return time;

    let [, hour, minute, suffix] = match;
    hour = hour.padStart(2, "0");
    minute = minute.slice(0, 2).padStart(2, "0"); // prevent 045

    return `${hour}:${minute}${suffix ? suffix.trim().toLowerCase() : ""}`;
  }

  async function onSubmit(values: z.infer<typeof iqamahTimingSchema>) {
    setIsSubmitting(true)
    try {
      const cleanedValues = {
        ...values,
        fajr: formatTime(values.fajr),
        dhuhr: formatTime(values.dhuhr),
        asr: formatTime(values.asr),
        maghrib: formatTime(values.maghrib),
        isha: formatTime(values.isha),
        jumuahI: formatTime(values.jumuahI || ""),
        jumuahII: formatTime(values.jumuahII || ""),
        jumuahIII: formatTime(values.jumuahIII || ""),
      }

      const result = await addIqamahTiming(cleanedValues)

      if (result.success) {
        toast({
          title: "Iqamah timing added",
          description: "New Iqamah timing has been added successfully.",
        })
        if (onSuccess) onSuccess()
      } else {
        const t = toast({
          title: "Error",
          description: "Failed to add Iqamah timing.",
          variant: "destructive",
        });
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
      <h2 className="text-xl font-semibold mb-6 text-[#550C18]">Add Iqamah</h2>

      <Form {...form}>
        <form onSubmit={async () => await onSubmit(form.getValues())} className="space-y-6">
          <div className="space-y-4">
            <div>
              <FormLabel className="block mb-2 text-[#3A3A3A]">Iqamah Change Date</FormLabel>
              <FormField
                control={form.control}
                name="changeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CalendarDatePicker
                        date={field.value}
                        onDateSelect={({ from, to }) => {
                          form.setValue("changeDate", { from, to });
                        }}
                        numberOfMonths={1}
                        className="min-w-[250px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel className="block mb-2 text-[#3A3A3A]">Fajr</FormLabel>
                <FormField
                  control={form.control}
                  name="fajr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                          className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2 text-[#3A3A3A]">Dhuhr</FormLabel>
                <FormField
                  control={form.control}
                  name="dhuhr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                          className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="block mb-2 text-[#3A3A3A]">Asr</FormLabel>
                <FormField
                  control={form.control}
                  name="asr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                          className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <FormLabel className="block mb-2 text-[#3A3A3A]">Maghrib</FormLabel>
                <FormField
                  control={form.control}
                  name="maghribType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full border-[#550C18]/20 focus-visible:ring-[#550C18]/30">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Offset">Offset</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.watch("maghribType") === "Fixed" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="maghrib"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TimeInput
                              value={field.value}
                              onChange={field.onChange}
                              className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="maghribOffset"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              type="number"
                              className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <div>
                <FormLabel className="block mb-2 text-[#3A3A3A]">Isha</FormLabel>
                <FormField
                  control={form.control}
                  name="isha"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                          className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-4 text-[#550C18]">Jumuah Prayer Times</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-2 gap-6">
                <div>
                  <FormLabel className="block mb-2 text-[#3A3A3A]">Jumuah I</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahI"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel className="block mb-2 text-[#3A3A3A]">Jumuah II</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahII"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel className="block mb-2 text-[#3A3A3A]">Jumuah III</FormLabel>
                  <FormField
                    control={form.control}
                    name="jumuahIII"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimeInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                          />
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
            <Button 
              type="submit" 
              className="bg-[#550C18] hover:bg-[#78001A] text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
