"use client"

import { useState } from "react"
import { columns, LeadList } from "./columns"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTableWithToolbar } from "@/components/ui/data-table/data-table-with-toolbar"
import { useRouter } from "next/navigation"

const data: LeadList[] = [
  {
    id: "1",
    dateAssigned: new Date().toISOString(),
    listType: "Cold",
    totalLeads: 150,
    assignedTo: "John Doe",
    status: "Active",
    progress: 45,
    lastUpdated: new Date().toISOString(),
  },
  // Add more mock data as needed
]

export function LeadListsClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.listType.toLowerCase().includes(searchLower) ||
      item.assignedTo.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower)
    )
  })

  return (
    <PageLayout
      title="Lead Lists Management"
      description="Manage and organize your lead lists effectively"
      addButton={{
        label: "Add New List",
        onClick: () => router.push('/dashboard/admin/crm/lead-lists/add')
      }}
    >
      <DataTableWithToolbar
        columns={columns}
        data={filteredData}
        searchKey="lead lists"
        onSearch={setSearchQuery}
        loading={isLoading}
        searchPlaceholder="Search lead lists..."
      />
    </PageLayout>
  )
} 