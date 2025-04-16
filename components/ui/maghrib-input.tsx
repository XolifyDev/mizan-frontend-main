"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimeInput } from "./time-input"
import { cn } from "@/lib/utils"

interface MaghribInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MaghribInput({ value, onChange, className }: MaghribInputProps) {
  const [inputType, setInputType] = useState<"Fixed" | "Offset">("Offset")
  const [timeValue, setTimeValue] = useState<string>("06:00 PM")

  useEffect(() => {
    if (value === "0") {
      setInputType("Offset")
    } else {
      setInputType("Fixed")
      setTimeValue(value || "06:00 PM")
    }
  }, [value])

  const handleTypeChange = (newType: string) => {
    if (newType === "Offset") {
      setInputType("Offset")
      onChange("0")
    } else {
      setInputType("Fixed")
      onChange(timeValue)
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    if (inputType === "Fixed") {
      onChange(newTime)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={inputType} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full border-[#550C18]/20 focus-visible:ring-[#550C18]/30">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Fixed">Fixed</SelectItem>
          <SelectItem value="Offset">Offset</SelectItem>
        </SelectContent>
      </Select>

      {inputType === "Fixed" ? (
        <TimeInput
          value={timeValue}
          onChange={handleTimeChange}
          className="mt-2 border-[#550C18]/20 focus-visible:ring-[#550C18]/30"
        />
      ) : (
        <p className="text-sm text-[#3A3A3A]/70 mt-1">Maghrib Iqamah will be at sunset</p>
      )}
    </div>
  )
}
