"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimeInput } from "./time-input"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface MaghribInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MaghribInput({ value, onChange, className }: MaghribInputProps) {
  const [inputType, setInputType] = useState<"Fixed" | "Offset">("Offset")
  const [timeValue, setTimeValue] = useState<string>("")
  const [offsetValue, setOffsetValue] = useState<number>(0)

  useEffect(() => {
    console.log(value, timeValue, inputType, "VALUE");
    if(value.includes("AM") || value.includes("PM")) {
      setInputType("Fixed")
      setTimeValue(value);
    } else {
      setInputType("Offset");
      setOffsetValue(value.length < 3 ? Number(value) : 0);
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

  const handleTimeChange = (newTime: string | number) => {
    if (inputType === "Fixed") {
      setTimeValue(newTime as string)
      onChange(newTime as string)
    } else {
      setOffsetValue(newTime as number);
      onChange(String(newTime));
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Select defaultValue={inputType} value={inputType} onValueChange={handleTypeChange}>
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
        <Input
          value={offsetValue}
          type="number"
          // @ts-ignore
          onChange={(e) => handleTimeChange(e.target.value)}
          onInput={(e) => {
            // @ts-ignore
            if (e.target.value.length > e.target.maxLength) e.target.value = e.target.value.slice(0, e.target.maxLength);
          }}
          maxLength={2}
          min={0}
          max={20}
        />
      )}
    </div>
  )
}
