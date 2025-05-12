"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns/meeting-tracker-columns"

export function MeetingTracker() {
  // This would be replaced with actual data from your API
  const data: any[] = []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meeting Tracker</h2>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-md">
            + New Meeting
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
          <option>Meeting Date</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Meeting Type</option>
        </select>
        <select className="border rounded-md px-3 py-2">
          <option>Status</option>
        </select>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
} 