"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Copy, Loader2, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
}

interface HSV {
  h: number
  s: number
  v: number
}

interface RGB {
  r: number
  g: number
  b: number
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else {
      h = (r - g) / diff + 4
    }
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : diff / max
  const v = max

  return { h, s, v }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255
  g /= 255
  b /= 255

  const k = 1 - Math.max(r, g, b)
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

export default function GoogleColorPicker({ value = "#3b82f6", onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(value)
  const rgb = hexToRgb(color)
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  const [hue, setHue] = useState(hsv.h)
  const [saturation, setSaturation] = useState(hsv.s)
  const [brightness, setBrightness] = useState(hsv.v);
  const [copying, setCopying] = useState(false);

  const saturationRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false)
  const [isDraggingHue, setIsDraggingHue] = useState(false)

  const updateColor = useCallback(
    (h: number, s: number, v: number) => {
      const newRgb = hsvToRgb(h, s, v)
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      setColor(newHex)
      onChange?.(newHex)
    },
    [onChange],
  )

  const handleSaturationMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSaturation(true)
    handleSaturationMove(e)
  }

  const handleSaturationMove = (e: React.MouseEvent) => {
    if (!saturationRef.current) return

    const rect = saturationRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    const newSaturation = x
    const newBrightness = 1 - y

    setSaturation(newSaturation)
    setBrightness(newBrightness)
    updateColor(hue, newSaturation, newBrightness)
  }

  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true)
    handleHueMove(e)
  }

  const handleHueMove = (e: React.MouseEvent) => {
    if (!hueRef.current) return

    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newHue = x * 360

    setHue(newHue)
    updateColor(newHue, saturation, brightness)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSaturation) {
        handleSaturationMove(e as any)
      }
      if (isDraggingHue) {
        handleHueMove(e as any)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingSaturation(false)
      setIsDraggingHue(false)
    }

    if (isDraggingSaturation || isDraggingHue) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingSaturation, isDraggingHue, hue, saturation, brightness, updateColor])

  const handleHexChange = (hex: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setColor(hex)
      onChange?.(hex)
      const newRgb = hexToRgb(hex)
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
      setHue(newHsv.h)
      setSaturation(newHsv.s)
      setBrightness(newHsv.v)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color)
    setCopying(true)
    setTimeout(() => {
      setCopying(false)
    }, 1000)
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)

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
      <PopoverContent className="w-80 p-4 bg-white shadow-xl" align="start">
        <div className="space-y-2">
          <div
            ref={saturationRef}
            className="relative w-full h-32 cursor-crosshair rounded"
            style={{
              background: `linear-gradient(to right, white, hsl(${hue}, 100%, 50%)), linear-gradient(to top, black, transparent)`,
            }}
            onMouseDown={handleSaturationMouseDown}
          >
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-2 -translate-y-2"
              style={{
                left: `${saturation * 100}%`,
                top: `${(1 - brightness) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            className="relative w-full h-4 cursor-pointer rounded"
            style={{
              background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg transform -translate-x-3 -translate-y-1"
              style={{
                left: `${(hue / 360) * 100}%`,
                backgroundColor: `hsl(${hue}, 100%, 50%)`,
              }}
            />
          </div>

          {/* Hex Input */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 text-center">HEX</div>
            <div className="relative">
              <Input
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  if (e.target.value.length === 7) {
                    handleHexChange(e.target.value)
                  }
                }}
                className="bg-muted text-black text-center font-mono pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-2 h-6 w-6 p-0 text-muted-foreground hover:text-black"
                onClick={copyToClipboard}
              >
                {copying ? <Copy className="h-3 w-3 text-green-500 scale-105" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Color Format Display */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded p-2 border border-gray-700 h-auto">
              <div className="text-xs text-gray-400 mb-1">RGB</div>
              <div className="text-xs text-black font-mono">{`${rgb.r}, ${rgb.g}, ${rgb.b}`}</div>
            </div>
            <div className="bg-muted rounded p-2 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">HSV</div>
              <div className="text-xs text-black font-mono">{`${Math.round(hue)}°, ${Math.round(saturation * 100)}%, ${Math.round(brightness * 100)}%`}</div>
            </div>
            <div className="bg-muted rounded p-2 border border-gray-700 col-span-2">
              <div className="text-xs text-gray-400 mb-1">HSL</div>
              <div className="text-xs text-black font-mono">{`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`}</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
