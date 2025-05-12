"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type LeadList = {
  id: string
  dateAssigned: string
  listType: string
  contactTierLevel: string
  bdr: string
  importLeads: boolean
  percentageOfListCompleted: number
  numberOfLeadRecords: number
  numberOfLeadRecordsEntered: number
  numberOfLeadRecordsCompleted: number
}

export const columns: ColumnDef<LeadList>[] = [
  {
    accessorKey: "dateAssigned",
    header: "Date Assigned",
  },
  {
    accessorKey: "listType",
    header: "List Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.getValue("listType")}
        </Badge>
      )
    }
  },
  {
    accessorKey: "contactTierLevel",
    header: "Contact Tier Level",
  },
  {
    accessorKey: "bdr",
    header: "BDR",
  },
  {
    accessorKey: "percentageOfListCompleted",
    header: "Progress",
    cell: ({ row }) => {
      const percentage = row.getValue("percentageOfListCompleted") as number
      return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )
    }
  },
  {
    accessorKey: "numberOfLeadRecords",
    header: "Total Leads",
  },
  {
    accessorKey: "numberOfLeadRecordsEntered",
    header: "Leads Entered",
  },
  {
    accessorKey: "numberOfLeadRecordsCompleted",
    header: "Leads Completed",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const leadList = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(leadList.id)}
            >
              Copy lead list ID
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 