"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageLayoutProps {
  title: string
  description: string
  searchPlaceholder?: string
  searchKey?: string
  onSearchChange?: (value: string) => void
  addButtonLabel?: string
  onAddClick?: () => void
  children: ReactNode
  listTitle?: string
  listDescription?: string
  addButton?: {
    label: string
    onClick: () => void
  }
}

export function PageLayout({
  title,
  description,
  searchPlaceholder,
  searchKey,
  onSearchChange,
  addButtonLabel,
  onAddClick,
  children,
  listTitle,
  listDescription,
  addButton,
}: PageLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {addButton && (
          <Button onClick={addButton.onClick} className="bg-red-500 hover:bg-red-600">
            <Plus className="mr-2 h-4 w-4" /> {addButton.label}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {searchPlaceholder && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Search {title}</CardTitle>
              <CardDescription>
                Find {searchKey || title.toLowerCase()} by name or other details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 mt-2">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 