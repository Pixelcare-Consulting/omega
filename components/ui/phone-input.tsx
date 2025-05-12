"use client"

import * as React from "react"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const countryCodes = [
  { code: "+1", label: "US" },
  { code: "+44", label: "UK" },
  { code: "+81", label: "JP" },
  { code: "+86", label: "CN" },
  { code: "+91", label: "IN" },
  // Add more country codes as needed
]

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState("+1")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [extension, setExtension] = React.useState("")

  React.useEffect(() => {
    // When external value changes, parse it
    if (value) {
      const match = value.match(/^(\+\d+)\s*(\(\d+\)\s*\d+-\d+)(?:\s*ext\.\s*(\d+))?$/)
      if (match) {
        setCountryCode(match[1])
        setPhoneNumber(match[2])
        setExtension(match[3] || "")
      }
    }
  }, [value])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value
    setPhoneNumber(newPhone)
    const fullNumber = `${countryCode} ${newPhone}${extension ? ` ext. ${extension}` : ""}`
    onChange(fullNumber)
  }

  const handleExtensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExt = e.target.value
    setExtension(newExt)
    const fullNumber = `${countryCode} ${phoneNumber}${newExt ? ` ext. ${newExt}` : ""}`
    onChange(fullNumber)
  }

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode)
    const fullNumber = `${newCode} ${phoneNumber}${extension ? ` ext. ${extension}` : ""}`
    onChange(fullNumber)
  }

  return (
    <div className="flex gap-2">
      <Select value={countryCode} onValueChange={handleCountryCodeChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder="(201) 555-0123"
        value={phoneNumber}
        onChange={handlePhoneChange}
        className="flex-1"
      />
      <Input
        type="text"
        placeholder="ext."
        value={extension}
        onChange={handleExtensionChange}
        className="w-[100px]"
      />
    </div>
  )
} 