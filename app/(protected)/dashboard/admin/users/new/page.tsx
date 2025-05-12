import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import UserForm from '@/app/(protected)/dashboard/admin/users/_components/user-form'

export default function NewUserPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New User</h1>
      </div>
      
      <UserForm />
    </div>
  )
} 