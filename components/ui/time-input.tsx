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
    let newHour = e.target.value.replace(/\D/g, "");

    const isFullySelected =
      e.target.selectionStart === 0 &&
      e.target.selectionEnd === e.target.value.length;

    // No auto-padding while typing
    if (isFullySelected) {
      // Use the new value as-is
    } else {
      if (newHour === "") {
        newHour = "";
      } else {
        const hourNum = Number.parseInt(newHour, 10);
        if (hourNum < 1) newHour = "1";
        if (hourNum > 12) newHour = "12";
      }
    }

    setHour(newHour);
    // Don't pad here
    updateTimeRaw(newHour, minute, period);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinute = e.target.value.replace(/\D/g, "");

    const isFullySelected =
      e.target.selectionStart === 0 &&
      e.target.selectionEnd === e.target.value.length;

    // No auto-padding while typing
    if (isFullySelected) {
      // Use the new value as-is
    }
    // Otherwise, keep the current logic

    setMinute(newMinute);
    // Don't pad here
    updateTimeRaw(hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    updateTime(hour, minute, newPeriod)
  }

  // Only pad when sending to parent (on blur or save)
  const updateTime = (h: string, m: string, p: string) => {
    if (h && m && p) {
      onChange(`${h.padStart(2, "0")}:${m.padStart(2, "0")} ${p}`);
    }
  };

  // While typing, don't pad
  const updateTimeRaw = (h: string, m: string, p: string) => {
    if (h && m && p) {
      onChange(`${h}:${m} ${p}`);
    }
  };

  // Pad on blur for display
  const handleHourBlur = () => {
    if (hour.length === 1) {
      setHour(hour.padStart(2, "0"));
    }
    updateTime(hour, minute, period);
  };
  const handleMinuteBlur = () => {
    if (minute.length === 1) {
      setMinute(minute.padStart(2, "0"));
    }
    updateTime(hour, minute, period);
  };

  return (
    <div className={cn("flex items-center space-x-2 w-full", className)}>
      <div className="flex items-center border-[#550C18]/20 border rounded-md">
        <Input
          type="number"
          value={hour}
          onChange={handleHourChange}
          className="w-16 text-center p-2 border-none focus-visible:text-[#550C18]"
          placeholder="--"
          inputMode="numeric"
          min={0}
          max={12}
          maxLength={2}
          onBlur={handleHourBlur}
        />
        <span className="mx-1 text-[#3A3A3A]">:</span>
        <Input
          type="number"
          value={minute}
          onChange={handleMinuteChange}
          className="w-16 text-center p-2 border-none focus-visible:border-none focus-visible:text-[#550C18]"
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
          onBlur={handleMinuteBlur}
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
