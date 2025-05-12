import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

import { getUserById } from '@/actions/user'
import { Button } from '@/components/ui/button'
import DeleteUserForm from '@/app/(protected)/dashboard/admin/users/_components/delete-user-form'

// Using a direct type without naming it
export default async function Page({ 
  params 
}: { 
  params: { id: string } 
}) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Delete User</h1>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-amber-800">Warning</h3>
          <p className="text-amber-700 text-sm">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1">{user.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="mt-1 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="mt-1">{user.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        
        <DeleteUserForm userId={user.id} />
      </div>
    </div>
  )
} 