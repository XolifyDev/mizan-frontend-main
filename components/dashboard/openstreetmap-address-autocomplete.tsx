"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface AddressData {
  fullAddress: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect: (addressData: AddressData) => void
  error?: boolean
  disabled?: boolean
}

export function OpenStreetMapAddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  error,
  disabled,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch address suggestions from OpenStreetMap Nominatim API
  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en-US,en",
          },
        },
      )
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching address suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce the input to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value) {
        fetchSuggestions(value)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  // Handle address selection
  const handleSelectAddress = (suggestion: any) => {
    const address = suggestion.display_name
    const addressDetails = suggestion.address

    // Extract address components
    const city = addressDetails.city || addressDetails.town || addressDetails.village || ""
    const state = addressDetails.state || ""
    const zipCode = addressDetails.postcode || ""
    const latitude = Number.parseFloat(suggestion.lat)
    const longitude = Number.parseFloat(suggestion.lon)

    onChange(`${addressDetails.house_number} ${addressDetails.road} ${suggestion.address.town ? suggestion.address.town : suggestion.address.county}, ${suggestion.address.state} ${suggestion.address.postcode}`)
    onAddressSelect({
      fullAddress: address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
    })
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Enter address"
          className={`border-[#550C18]/20 focus:border-[#550C18] focus:ring-[#550C18] ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-[#550C18]" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-[#550C18]/10 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-base">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-[#550C18]/5"
                onClick={() => handleSelectAddress(suggestion)}
              >
                {suggestion.address.house_number} {suggestion.address.road}, {suggestion.address.town ? suggestion.address.town : suggestion.address.county}, {suggestion.address.state} {suggestion.address.postcode}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

