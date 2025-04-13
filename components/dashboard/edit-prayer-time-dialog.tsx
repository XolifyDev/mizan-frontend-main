"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updatePrayerTime } from "@/lib/actions/prayer-times"

interface EditPrayerTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prayerTime: {
    id: string
    date: string
    prayer: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha"
    time: string
  }
  masjidId: string
  onSuccess: () => void
}

export function EditPrayerTimeDialog({
  open,
  onOpenChange,
  prayerTime,
  masjidId,
  onSuccess,
}: EditPrayerTimeDialogProps) {
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(0)
  const [period, setPeriod] = useState("AM")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Parse the time when the dialog opens
  useEffect(() => {
    if (open && prayerTime.time) {
      const [timeStr, timePeriod] = prayerTime.time.split(" ")
      const [hoursStr, minutesStr] = timeStr.split(":")

      setHours(Number.parseInt(hoursStr, 10))
      setMinutes(Number.parseInt(minutesStr, 10))
      setPeriod(timePeriod || "AM")
    }
  }, [open, prayerTime.time])

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPrayerName = (prayer: string) => {
    const prayerNames = {
      fajr: "Fajr",
      sunrise: "Sunrise",
      dhuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib",
      isha: "Isha",
    }
    return prayerNames[prayer as keyof typeof prayerNames] || prayer
  }

  const handleHoursChange = (value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue)) return

    // Ensure hours are between 1-12 for 12-hour format
    if (numValue >= 1 && numValue <= 12) {
      setHours(numValue)
    } else if (numValue > 12) {
      setHours(12)
    } else if (numValue < 1 || value === "") {
      setHours(1)
    }
  }

  const handleMinutesChange = (value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue)) return

    // Ensure minutes are between 0-59
    if (numValue >= 0 && numValue <= 59) {
      setMinutes(numValue)
    } else if (numValue > 59) {
      setMinutes(59)
    } else if (value === "") {
      setMinutes(0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Format hours and minutes with leading zeros
      const hoursFormatted = hours.toString().padStart(2, "0")
      const minutesFormatted = minutes.toString().padStart(2, "0")
      const formattedTime = `${hoursFormatted}:${minutesFormatted} ${period}`

      const result = await updatePrayerTime(prayerTime.id, prayerTime.prayer, formattedTime)

      if (result.success) {
        toast({
          title: "Success",
          description: "Prayer time updated successfully",
        });
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update prayer time",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#3A3A3A]">
            Update {getPrayerName(prayerTime.prayer)} Time
          </DialogTitle>
          <DialogDescription className="text-[#3A3A3A]/70">{formatDate(prayerTime.date)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-1/2">
                <label htmlFor="hours" className="text-sm font-medium text-[#3A3A3A] mb-1 block">
                  Hours
                </label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={12}
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  className="border-[#550C18]/20 focus:ring-[#550C18]"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="minutes" className="text-sm font-medium text-[#3A3A3A] mb-1 block">
                  Minutes
                </label>
                <Input
                  id="minutes"
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  className="border-[#550C18]/20 focus:ring-[#550C18]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="period" className="text-sm font-medium text-[#3A3A3A] mb-1 block">
                AM/PM
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" className="w-[80px] border-[#550C18]/20 focus:ring-[#550C18]">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#550C18] hover:bg-[#78001A] text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

