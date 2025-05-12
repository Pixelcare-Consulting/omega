"use client"

import { useState } from "react"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DataTableWithToolbar } from "@/components/ui/data-table/data-table-with-toolbar"
import { columns } from "./columns"

interface Customer {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  type: "direct" | "distributor" | "retailer"
  createdAt: string
  lastOrder: string
}

const data: Customer[] = [
  {
    id: "1",
    companyName: "Acme Corp",
    contactPerson: "John Doe",
    email: "john@acme.com",
    phone: "+1-555-0123",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    status: "active",
    type: "direct",
    createdAt: new Date().toISOString(),
    lastOrder: new Date().toISOString(),
  },
  // Add more mock data as needed
]

export function Customers() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.companyName.toLowerCase().includes(searchLower) ||
      item.contactPerson.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <PageLayout
      title="Customer Management"
      description="Manage and track your global procurement customers"
      addButton={{
        label: "Add Customer",
        onClick: () => router.push('/dashboard/admin/global-procurement/customers/add')
      }}
    >
      <DataTableWithToolbar
        columns={columns}
        data={filteredData as any}
        searchKey="customers"
        onSearch={setSearchQuery}
        loading={isLoading}
        searchPlaceholder="Search customers..."
      />
    </PageLayout>
  )
} 