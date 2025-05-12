"use client"

import { ColumnDef } from "@tanstack/react-table"

export type CallLog = {
  id: string
  callId: string
  contactCompanyName: string
  contactFullName: string
  contactTrimDirectPhone: string
  contactTrimMobilePhone: string
  dateCreated: string
  dateModified: string
  dateTime: string
}

export const columns: ColumnDef<CallLog>[] = [
  {
    accessorKey: "callId",
    header: "Call ID"
  },
  {
    accessorKey: "contactCompanyName",
    header: "Contact - Customer - Company Name"
  },
  {
    accessorKey: "contactFullName",
    header: "Contact - Full Name"
  },
  {
    accessorKey: "contactTrimDirectPhone",
    header: "Contact - Trim Direct Phone"
  },
  {
    accessorKey: "contactTrimMobilePhone",
    header: "Contact - Trim Mobile Phone"
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created"
  },
  {
    accessorKey: "dateModified",
    header: "Date Modified"
  },
  {
    accessorKey: "dateTime",
    header: "Date/Time"
  }
] 