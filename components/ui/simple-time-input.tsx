"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SimpleTimeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SimpleTimeInput({ value, onChange, disabled = false }: SimpleTimeInputProps) {
  const [hours, setHours] = useState<string>("12")
  const [minutes, setMinutes] = useState<string>("00")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  // Parse the initial value
  useEffect(() => {
    if (!value) {
      setHours("12")
      setMinutes("00")
      setPeriod("AM")
      return
    }

    try {
      const [timeStr, timePeriod] = value.split(" ")
      const [hoursStr, minutesStr] = timeStr.split(":")

      setHours(hoursStr)
      setMinutes(minutesStr)
      setPeriod(timePeriod as "AM" | "PM")
    } catch (error) {
      console.error("Error parsing time:", error)
    }
  }, [value])

  // Update the parent component when any value changes
  useEffect(() => {
    onChange(`${hours}:${minutes} ${period}`)
  }, [hours, minutes, period, onChange])

  return (
    <div className="flex items-center gap-2">
      <Input
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="w-16 text-center"
        disabled={disabled}
      />
      <span className="text-gray-500">:</span>
      <Input
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        className="w-16 text-center"
        disabled={disabled}
      />
      <Select value={period} onValueChange={(val) => setPeriod(val as "AM" | "PM")} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
