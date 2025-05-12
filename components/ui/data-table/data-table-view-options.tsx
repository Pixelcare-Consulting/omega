"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { View } from "lucide-react"
import { Table } from "@tanstack/react-table"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 border-dashed"
        >
          <View className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <div
                key={column.id}
                className="flex items-center px-4 py-2 hover:bg-accent"
              >
                <label
                  htmlFor={column.id}
                  className="flex flex-1 items-center cursor-pointer"
                >
                  <input
                    id={column.id}
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={(e) => column.toggleVisibility(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="capitalize">{column.id}</span>
                </label>
              </div>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 