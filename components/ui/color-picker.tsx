"use client"

import { useState } from "react"
import { Check, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const presetColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#000000",
  "#ffffff",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
]

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export default function ColorPicker({ value = "#3b82f6", onChange, className }: ColorPickerProps) {
  const [color, setColor] = useState(value)
  const [open, setOpen] = useState(false)

  const [h, s, l] = hexToHsl(color)
  const [hue, setHue] = useState(h)
  const [saturation, setSaturation] = useState(s)
  const [lightness, setLightness] = useState(l)

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange?.(newColor)
    const [newH, newS, newL] = hexToHsl(newColor)
    setHue(newH)
    setSaturation(newS)
    setLightness(newL)
  }

  const handleSliderChange = (newHue: number, newSaturation: number, newLightness: number) => {
    setHue(newHue)
    setSaturation(newSaturation)
    setLightness(newLightness)
    const newColor = hslToHex(newHue, newSaturation, newLightness)
    setColor(newColor)
    onChange?.(newColor)
  }

  const handleHexInput = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      handleColorChange(hex)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal", className)}>
          <div className="flex items-center gap-2 w-full">
            <div className="h-4 w-4 rounded border border-border" style={{ backgroundColor: color }} />
            <span>{color}</span>
            <Palette className="ml-auto h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={cn(
                    "h-8 w-8 rounded border-2 border-transparent hover:scale-105 transition-transform",
                    color === presetColor && "border-foreground",
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                >
                  {color === presetColor && <Check className="h-4 w-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Custom Color</Label>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Hue</Label>
              <Slider
                value={[hue]}
                onValueChange={([value]) => handleSliderChange(value, saturation, lightness)}
                max={360}
                step={1}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), 
                    hsl(60, 100%, 50%), 
                    hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), 
                    hsl(240, 100%, 50%), 
                    hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`,
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saturation</Label>
              <Slider
                value={[saturation]}
                onValueChange={([value]) => handleSliderChange(hue, value, lightness)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Lightness</Label>
              <Slider
                value={[lightness]}
                onValueChange={([value]) => handleSliderChange(hue, saturation, value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Hex Color</Label>
            <Input
              value={color}
              onChange={(e) => {
                setColor(e.target.value)
                if (e.target.value.length === 7) {
                  handleHexInput(e.target.value)
                }
              }}
              placeholder="#000000"
              className="font-mono"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="h-16 w-full rounded border border-border" style={{ backgroundColor: color }} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
