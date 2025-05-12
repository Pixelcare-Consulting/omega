"use client"

import { createContext, useContext, useState } from "react"
import { LeadList } from "../columns/lead-lists-columns"

interface LeadListsContextType {
  data: LeadList[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredData: LeadList[]
}

const LeadListsContext = createContext<LeadListsContextType | undefined>(undefined)

export function LeadListsProvider({ children }: { children: React.ReactNode }) {
  const [data] = useState<LeadList[]>([
    {
      id: "1",
      dateAssigned: "2024-03-20",
      listType: "Cold Outreach",
      contactTierLevel: "Tier 1",
      bdr: "John Doe",
      importLeads: "Imported",
      percentageOfListCompleted: "75%",
      numberOfLeadRecords: "100",
      numberOfLeadRecordsEntered: "80",
      numberOfLeadRecordsCompleted: "75"
    },
    // Add more sample data as needed
  ])
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.listType.toLowerCase().includes(searchLower) ||
      item.contactTierLevel.toLowerCase().includes(searchLower) ||
      item.bdr.toLowerCase().includes(searchLower)
    )
  })

  return (
    <LeadListsContext.Provider
      value={{
        data,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        filteredData,
      }}
    >
      {children}
    </LeadListsContext.Provider>
  )
}

export function useLeadLists() {
  const context = useContext(LeadListsContext)
  if (context === undefined) {
    throw new Error("useLeadLists must be used within a LeadListsProvider")
  }
  return context
} 