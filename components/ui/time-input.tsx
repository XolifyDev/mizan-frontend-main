"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TimeInput({ value, onChange, className }: TimeInputProps) {
  const [hour, setHour] = useState<string>("12")
  const [minute, setMinute] = useState<string>("00")
  const [period, setPeriod] = useState<string>("AM");

  useEffect(() => {
    if (value) {
      try {
        // Parse the time string (e.g., "06:30 AM")
        const match = value.match(/(\d+):(\d+)\s+(AM|PM)/)
        if (match) {
          setHour(value.split(":")[0])
          setMinute(value.split(":")[1].split(" ")[0])
          setPeriod(value.split(" ")[1])
        }
      } catch (error) {
        console.error("Error parsing time:", error)
      }
    }
  }, [value])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHour = e.target.value.replace(/\D/g, "")

    // Ensure hour is between 1 and 12
    if (newHour === "") {
      newHour = ""
    } else {
      const hourNum = Number.parseInt(newHour, 10)
      if (hourNum < 1) newHour = "1"
      if (hourNum > 12) newHour = "12"
    }

    setHour(newHour)
    updateTime(newHour, minute, period)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinute = e.target.value.replace(/\D/g, "")
    setMinute(newMinute)
    updateTime(hour, newMinute, period)
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    updateTime(hour, minute, newPeriod)
  }

  const updateTime = (h: string, m: string, p: string) => {
    if (h && m && p) {
      onChange(`${h.padStart(2, "0")}:${m.padStart(2, "0")} ${p}`)
    }
  }

  return (
    <div className={cn("flex items-center space-x-2 w-full", className)}>
      <div className="flex items-center border-[#550C18]/20 border rounded-md">
        <Input
          type="number"
          value={hour}
          onChange={handleHourChange}
          className="w-12 text-center p-2 border-none focus-visible:text-[#550C18]"
          placeholder="--"
          inputMode="numeric"
          min={0}
          max={12}
          maxLength={2}
        />
        <span className="mx-1 text-[#3A3A3A]">:</span>
        <Input
          type="number"
          value={minute}
          onChange={handleMinuteChange}
          className="w-12 text-center p-2 border-none focus-visible:border-none focus-visible:text-[#550C18]"
          placeholder="--"
          inputMode="numeric"
          required
          min={0}
          max={59}
          maxLength={2}
          onInput={(e) => {
            // @ts-ignore
            if (e.target.value.length > e.target.maxLength) e.target.value = e.target.value.slice(0, e.target.maxLength);
          }}
        />
      </div>
      <Select defaultValue={value.split(" ")[1]} value={value.split(" ")[1]} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full border-[#550C18]/20 focus-visible:ring-[#550C18]/30">
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
