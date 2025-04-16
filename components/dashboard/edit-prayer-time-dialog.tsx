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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updatePrayerTime } from "@/lib/actions/prayer-times"
import { Input } from "@/components/ui/input"

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
  const [hours, setHours] = useState<string>("12")
  const [minutes, setMinutes] = useState<string>("00")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Parse the time when the dialog opens
  useEffect(() => {
    if (open && prayerTime.time) {
      const [timeStr, timePeriod] = prayerTime.time.split(" ")
      const [hoursStr, minutesStr] = timeStr.split(":")

      setHours(hoursStr)
      setMinutes(minutesStr)
      setPeriod(timePeriod as "AM" | "PM")
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const formattedTime = `${hours}:${minutes} ${period}`

      const result = await updatePrayerTime(prayerTime.id, prayerTime.prayer, formattedTime)

      if (result.success) {
        toast({
          title: "Success",
          description: "Prayer time updated successfully",
        })
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
          <DialogTitle className="text-xl font-semibold">Update {getPrayerName(prayerTime.prayer)} Time</DialogTitle>
          <DialogDescription>{formatDate(prayerTime.date)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input value={hours} onChange={(e) => setHours(e.target.value)} className="w-16 text-center" />
            <span className="text-gray-500">:</span>
            <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-16 text-center" />
            <Select value={period} onValueChange={(val) => setPeriod(val as "AM" | "PM")}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
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
