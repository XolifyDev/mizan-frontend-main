"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { TimeInput } from "@/components/ui/time-input"
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker"
import { Input } from "@/components/ui/input"
import { bulkCreateIqamahTimings } from "@/lib/actions/prayer-times"
import { Plus, X } from "lucide-react"
import { Label } from "@/components/ui/label"

// Schema for bulk iqamah timing
const bulkIqamahTimingSchema = {
  masjidId: "string",
  startDate: "object",
  endDate: "object",
  fajr: "string",
  dhuhr: "string",
  asr: "string",
  maghrib: "string",
  maghribType: "string",
  maghribOffset: "string",
  isha: "string",
  jumuahI: "string?",
  jumuahII: "string?",
  jumuahIII: "string?",
}

type IqamahTimingEntry = {
  changeDate: Date;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  maghribType: string;
  maghribOffset: string;
  isha: string;
  jumuahI: string;
  jumuahII: string;
  jumuahIII: string;
}

type BulkIqamahTimingFormProps = {
  masjidId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BulkIqamahTimingForm({ masjidId, onSuccess, onCancel }: BulkIqamahTimingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iqamahEntries, setIqamahEntries] = useState<IqamahTimingEntry[]>([
    {
      changeDate: new Date(),
      fajr: "",
      dhuhr: "",
      asr: "",
      maghrib: "0",
      maghribOffset: "0",
      maghribType: "Offset",
      isha: "",
      jumuahI: "",
      jumuahII: "",
      jumuahIII: "",
    }
  ])

  function formatTime(time: string): string {
    if (!time) return "";

    // Match common time formats like HH:MM or HH:MM am/pm
    const match = time.match(/^(\d{1,2}):(\d{1,2})(\s?[aApP][mM])?$/);

    if (!match) return time;

    let [, hour, minute, suffix] = match;
    hour = hour.padStart(2, "0");
    minute = minute.slice(0, 2).padStart(2, "0");

    return `${hour}:${minute}${suffix ? suffix.trim().toLowerCase() : ""}`;
  }

  const addIqamahEntry = () => {
    setIqamahEntries([...iqamahEntries, {
      changeDate: new Date(),
      fajr: "",
      dhuhr: "",
      asr: "",
      maghrib: "0",
      maghribOffset: "0",
      maghribType: "Offset",
      isha: "",
      jumuahI: "",
      jumuahII: "",
      jumuahIII: "",
    }]);
  };

  const removeIqamahEntry = (index: number) => {
    if (iqamahEntries.length > 1) {
      setIqamahEntries(iqamahEntries.filter((_, i) => i !== index));
    }
  };

  const updateIqamahEntry = (index: number, field: keyof IqamahTimingEntry, value: any) => {
    const updatedEntries = [...iqamahEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setIqamahEntries(updatedEntries);
  };

  async function onSubmit() {
    setIsSubmitting(true)
    try {
      // Sort entries by change date
      const sortedEntries = [...iqamahEntries].sort((a, b) => a.changeDate.getTime() - b.changeDate.getTime());
      
      // Get the date range
      const startDate = sortedEntries[0].changeDate;
      const endDate = sortedEntries[sortedEntries.length - 1].changeDate;
      
      // Create iqamah timings for each entry
      const results = await Promise.all(
        sortedEntries.map(async (entry) => {
          const cleanedData = {
            fajr: formatTime(entry.fajr),
            dhuhr: formatTime(entry.dhuhr),
            asr: formatTime(entry.asr),
            maghrib: formatTime(entry.maghrib),
            maghribType: entry.maghribType,
            maghribOffset: entry.maghribOffset,
            isha: formatTime(entry.isha),
            jumuahI: formatTime(entry.jumuahI || ""),
            jumuahII: formatTime(entry.jumuahII || ""),
            jumuahIII: formatTime(entry.jumuahIII || ""),
          };

          return await bulkCreateIqamahTimings(
            masjidId,
            startDate,
            endDate,
            cleanedData,
            [entry.changeDate]
          );
        })
      );

      // Check if all operations were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast({
          title: "Bulk Iqamah timings created",
          description: `${sortedEntries.length} iqamah timing(s) have been set successfully.`,
        })
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: "Some iqamah timings failed to be created.",
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
      <h2 className="text-xl font-semibold mb-6 text-[#550C18]">Bulk Create Iqamah Timings</h2>

      <div className="space-y-6">
        {iqamahEntries.map((entry, index) => (
          <div key={index} className="border border-[#550C18]/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#550C18]">
                Iqamah Timing #{index + 1}
              </h3>
              {iqamahEntries.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIqamahEntry(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block mb-2 text-[#3A3A3A]">Change Date</Label>
                <CalendarDatePicker
                  date={{ from: entry.changeDate, to: entry.changeDate }}
                  onDateSelect={({ from }) => {
                    if (from) updateIqamahEntry(index, 'changeDate', from);
                  }}
                  numberOfMonths={1}
                  className="min-w-[250px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block mb-2 text-[#3A3A3A]">Fajr</Label>
                  <TimeInput
                    value={entry.fajr}
                    onChange={(value) => updateIqamahEntry(index, 'fajr', value)}
                    className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                  />
                </div>

                <div>
                  <Label className="block mb-2 text-[#3A3A3A]">Dhuhr</Label>
                  <TimeInput
                    value={entry.dhuhr}
                    onChange={(value) => updateIqamahEntry(index, 'dhuhr', value)}
                    className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                  />
                </div>

                <div>
                  <Label className="block mb-2 text-[#3A3A3A]">Asr</Label>
                  <TimeInput
                    value={entry.asr}
                    onChange={(value) => updateIqamahEntry(index, 'asr', value)}
                    className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="block mb-2 text-[#3A3A3A]">Maghrib</Label>
                  <Select 
                    value={entry.maghribType} 
                    onValueChange={(value) => updateIqamahEntry(index, 'maghribType', value)}
                  >
                    <SelectTrigger className="w-full border-[#550C18]/20 focus-visible:ring-[#550C18]/30">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Offset">Offset</SelectItem>
                    </SelectContent>
                  </Select>
                  {entry.maghribType === "Fixed" ? (
                    <TimeInput
                      value={entry.maghrib}
                      onChange={(value) => updateIqamahEntry(index, 'maghrib', value)}
                      className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                    />
                  ) : (
                    <Input
                      value={entry.maghribOffset}
                      onChange={(e) => updateIqamahEntry(index, 'maghribOffset', e.target.value)}
                      type="number"
                      className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                    />
                  )}
                </div>

                <div>
                  <Label className="block mb-2 text-[#3A3A3A]">Isha</Label>
                  <TimeInput
                    value={entry.isha}
                    onChange={(value) => updateIqamahEntry(index, 'isha', value)}
                    className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                  />
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-md font-medium mb-4 text-[#550C18]">Jumuah Prayer Times</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-2 gap-6">
                  <div>
                    <Label className="block mb-2 text-[#3A3A3A]">Jumuah I</Label>
                    <TimeInput
                      value={entry.jumuahI || ""}
                      onChange={(value) => updateIqamahEntry(index, 'jumuahI', value)}
                      className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2 text-[#3A3A3A]">Jumuah II</Label>
                    <TimeInput
                      value={entry.jumuahII || ""}
                      onChange={(value) => updateIqamahEntry(index, 'jumuahII', value)}
                      className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2 text-[#3A3A3A]">Jumuah III</Label>
                    <TimeInput
                      value={entry.jumuahIII || ""}
                      onChange={(value) => updateIqamahEntry(index, 'jumuahIII', value)}
                      className="border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addIqamahEntry}
          className="w-full border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Iqamah Timing
        </Button>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#550C18] hover:bg-[#78001A] text-white" 
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? "Creating..." : `Create ${iqamahEntries.length} Iqamah Timing(s)`}
          </Button>
        </div>
      </div>
    </div>
  )
} 