"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, Employee } from "./columns/employees-columns"

export function Employees() {
  // This would be replaced with actual data from your API
  const data: Employee [] = [
    {
      employeeName: "Caira Andrea Husmillo",
      location: "Philippines",
      department: "Accounting",
      inactive: false,
      email: "chusmillo@omegagti.com"
    },
    {
      employeeName: "Linda Tang",
      location: "Other",
      department: "Purchasing",
      inactive: false,
      email: "ltang@omegagti.com"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Employees</h2>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md">
            Refresh Data
          </button>
          <button className="bg-secondary text-white px-4 py-2 rounded-md">
            Import/Export
          </button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search records"
          className="border rounded-md px-3 py-2"
        />
        <select className="border rounded-md px-3 py-2">
          <option>Employee Name</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Location</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Department</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Inactive</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Email</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 