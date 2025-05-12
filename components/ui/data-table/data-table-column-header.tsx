"use client"

import { Column } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("flex items-center", className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn(
        "flex items-center gap-1 p-0 font-medium hover:bg-transparent hover:text-foreground/80",
        className
      )}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
      )}
    </Button>
  )
} 