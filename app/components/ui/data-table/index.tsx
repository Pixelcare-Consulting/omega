'use client'

import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileDown, Filter, PlusCircle, RefreshCw, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    header: string
    cell: (item: T) => React.ReactNode
    className?: string
  }[]
  title: string
  subtitle?: string
  totalItems: number
  loading?: boolean
  pageSize: number
  currentPage: number
  onSearch: (term: string) => void
  onRefresh?: () => void
  onPageChange: (page: number) => void
  searchPlaceholder?: string
  searchTerm?: string
  onAddNew?: () => void
  addNewLabel?: string
  onExport?: () => void
  stats?: {
    items: {
      title: string
      value: string | number
      percentage?: string
      icon: React.ReactElement
      color: "blue" | "green" | "orange" | "purple"
    }[]
  }
  emptyState?: {
    icon?: React.ReactElement
    title: string
    description?: string
  }
}

// Stat card component
const StatCard = ({ 
  title, 
  value, 
  percentage, 
  icon, 
  color = "blue" 
}: { 
  title: string, 
  value: string | number, 
  percentage?: string, 
  icon: React.ReactElement,
  color: "blue" | "green" | "orange" | "purple" 
}) => {
  const borderColors = {
    blue: "border-t-blue-500",
    green: "border-t-green-500",
    orange: "border-t-orange-500",
    purple: "border-t-purple-500"
  };
  
  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    purple: "text-purple-500"
  };
  
  return (
    <div className={`bg-card rounded-xl border border-t-4 ${borderColors[color]} p-5 h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] group`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center bg-card shadow-sm ${iconColors[color]} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-2">{percentage}</p>
      </div>
    </div>
  );
};

export function DataTable<T>({
  data,
  columns,
  title,
  subtitle,
  totalItems,
  loading = false,
  pageSize,
  currentPage,
  onSearch,
  onRefresh,
  onPageChange,
  searchPlaceholder = "Search...",
  searchTerm = "",
  onAddNew,
  addNewLabel = "Add New",
  onExport,
  stats,
  emptyState = { title: "No data found", description: "Try adjusting your search or filter criteria" }
}: DataTableProps<T>) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filterOpen, setFilterOpen] = React.useState(false)
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchValue = formData.get('search') as string
    onSearch(searchValue)
  }
  
  const renderLoading = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-muted rounded-md w-full"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-md w-full"></div>
      ))}
    </div>
  )
  
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      {emptyState.icon || <div className="h-12 w-12 text-muted-foreground mb-3">❓</div>}
      <p className="text-lg font-medium">{emptyState.title}</p>
      {emptyState.description && (
        <p className="text-sm text-muted-foreground mt-1">{emptyState.description}</p>
      )}
    </div>
  )
  
  return (
    <div className="space-y-8 w-full">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-primary rounded-full"></div>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            {subtitle && <p className="text-muted-foreground mt-1 ml-3">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 self-end">
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-9 px-3 rounded-md border-dashed transition-all hover:border-primary hover:text-primary"
                onClick={onExport}
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            {onAddNew && (
              <Button 
                onClick={onAddNew} 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-9 px-4 rounded-md shadow-sm transition-transform hover:translate-y-[-2px]"
              >
                <PlusCircle className="h-4 w-4" />
                {addNewLabel}
              </Button>
            )}
          </div>
        </div>

        {stats && stats.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.items.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title} 
                value={stat.value} 
                percentage={stat.percentage} 
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <div className="relative rounded-md border border-input overflow-hidden shadow-sm transition-all duration-300 
              hover:shadow focus-within:border-t-primary focus-within:border-t-[3px] bg-card">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="search"
                  name="search"
                  placeholder={searchPlaceholder}
                  className="flex h-11 w-full rounded-md bg-transparent py-2 pl-10 pr-8 ring-offset-background focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 border-0"
                  defaultValue={searchTerm}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => onSearch('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end ml-auto">
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 rounded-md transition-colors ${filterOpen ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-md transition-colors hover:bg-muted"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            )}
            
            <select
              className="h-10 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all hover:bg-muted"
              value={pageSize}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams?.toString())
                params.set('size', e.target.value)
                if (params.has('page')) params.set('page', '1')
                router.push(`?${params.toString()}`)
              }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
        
        {filterOpen && (
          <div className="bg-card rounded-lg border-t-4 border border-primary p-5 mb-6 w-full shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="text-sm font-medium mb-3">Filter options can be customized per table</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Filter content would be customized per implementation */}
            </div>
          </div>
        )}
        
        <div className="overflow-hidden rounded-lg border border-t-0 shadow-sm w-full bg-card transition-all hover:shadow-md">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {renderLoading()}
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {renderEmptyState()}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column.key}`}>
                          {column.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{data.length}</span> of <span className="font-medium">{totalItems || 0}</span> items
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md gap-1"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
              <div className="flex items-center bg-muted rounded-md h-8 px-2">
                <span className="text-xs">Page {currentPage} of {Math.ceil(totalItems / pageSize) || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md gap-1"
                disabled={data.length < pageSize}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
                <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 