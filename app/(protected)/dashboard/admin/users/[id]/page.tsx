import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { getUserById } from '@/actions/user'
import { Button } from '@/components/ui/button'
import UserForm from '@/app/(protected)/dashboard/admin/users/_components/user-form'

interface EditUserPageProps {
  params: { id: string }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
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
        <h1 className="text-2xl font-bold">Edit User</h1>
      </div>
      
      <UserForm user={user} />
    </div>
  )
} 