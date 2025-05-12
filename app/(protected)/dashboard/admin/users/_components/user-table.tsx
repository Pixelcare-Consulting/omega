'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { User } from '@prisma/client'
import { CheckCircle, Edit, Trash2, XCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'

interface UserWithProfile extends User {
  profile: {
    id: string
    userId: string
    details: any
  } | null
}

interface UserTableProps {
  users: UserWithProfile[]
  pagination: {
    total: number
    pageCount: number
    page: number
    pageSize: number
  }
  onEdit?: (userId: string) => void
  onDelete?: (userId: string) => void
}

export function UserTable({ users, pagination, onEdit, onDelete }: UserTableProps) {
  const searchParams = useSearchParams()
  
  // Helper function to create URLs with pagination
  const createPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNum.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span>Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onEdit ? (
                        <Button variant="outline" size="icon" onClick={() => onEdit(user.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Link href={`/dashboard/admin/users/${user.id}`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      
                      {onDelete ? (
                        <Button variant="outline" size="icon" onClick={() => onDelete(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Link href={`/dashboard/admin/users/${user.id}/delete`}>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            {pagination.page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPaginationUrl(pagination.page - 1)} />
              </PaginationItem>
            )}

            {Array.from({ length: pagination.pageCount }).map((_, i) => {
              const pageNumber = i + 1
              // Show first page, last page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === pagination.pageCount ||
                (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={createPaginationUrl(pageNumber)}
                      isActive={pageNumber === pagination.page}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              }

              // Show ellipsis for gaps
              if (
                (pageNumber === 2 && pagination.page > 3) ||
                (pageNumber === pagination.pageCount - 1 && pagination.page < pagination.pageCount - 2)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return null
            })}

            {pagination.page < pagination.pageCount && (
              <PaginationItem>
                <PaginationNext href={createPaginationUrl(pagination.page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
} 