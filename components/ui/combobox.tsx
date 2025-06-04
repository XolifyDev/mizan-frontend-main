"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  value: string
  label: string
}

interface ComboboxProps {
  options: Option[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  multiple?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className,
  multiple = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedValues = multiple ? (value as string[] || []) : [value as string || ""]

  const getDisplayValue = () => {
    if (!value) return placeholder
    
    if (multiple) {
      const selected = (value as string[]).map(v => 
        options.find(opt => opt.value === v)?.label
      ).filter(Boolean)
      return selected.length > 0 ? selected.join(", ") : placeholder
    }

    return options.find(opt => opt.value === value)?.label || placeholder
  }

  const handleSelect = (currentValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(currentValue)
        ? selectedValues.filter(v => v !== currentValue)
        : [...selectedValues, currentValue]
      onChange(newValues)
    } else {
      onChange(currentValue === value ? "" : currentValue)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between truncate", className)}
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
