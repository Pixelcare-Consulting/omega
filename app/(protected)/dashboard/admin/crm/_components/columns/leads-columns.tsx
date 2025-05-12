"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Lead = {
  id: string
  companyDivisionName: string
  companyHQPhone: string
  companyHQPhoneTrimmed: string
  companyName: string
  dateCreated: string
  dateModified: string
  department: string
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "companyDivisionName",
    header: "Company Division Name"
  },
  {
    accessorKey: "companyHQPhone",
    header: "Company HQ Phone"
  },
  {
    accessorKey: "companyHQPhoneTrimmed",
    header: "Company HQ Phone (Trimmed)"
  },
  {
    accessorKey: "companyName",
    header: "Company Name"
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
    accessorKey: "department",
    header: "Department"
  }
] 