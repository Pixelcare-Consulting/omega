"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Meeting = {
  id: string
  meetingDate: string
  meetingType: string
  status: string
  attendees: string
  notes: string
  followUpDate: string
  createdBy: string
  createdDate: string
}

export const columns: ColumnDef<Meeting>[] = [
  {
    accessorKey: "meetingDate",
    header: "Meeting Date"
  },
  {
    accessorKey: "meetingType",
    header: "Meeting Type"
  },
  {
    accessorKey: "status",
    header: "Status"
  },
  {
    accessorKey: "attendees",
    header: "Attendees"
  },
  {
    accessorKey: "notes",
    header: "Notes"
  },
  {
    accessorKey: "followUpDate",
    header: "Follow-up Date"
  },
  {
    accessorKey: "createdBy",
    header: "Created By"
  },
  {
    accessorKey: "createdDate",
    header: "Created Date"
  }
] 