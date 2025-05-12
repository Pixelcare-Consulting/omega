'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { deleteUser, hardDeleteUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface DeleteUserFormProps {
  userId: string
  onSuccess?: () => void
  isModal?: boolean
}

export default function DeleteUserForm({ userId, onSuccess, isModal = false }: DeleteUserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isHardDelete, setIsHardDelete] = React.useState(false)

  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (isHardDelete) {
        await hardDeleteUser(userId)
      } else {
        await deleteUser(userId)
      }

      // If onSuccess callback is provided, call it
      if (onSuccess) {
        onSuccess()
      } else {
        // Otherwise, navigate back to users page
        router.push('/dashboard/admin/users')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <div className="font-medium">Hard Delete</div>
          <div className="text-sm text-muted-foreground">
            {isHardDelete 
              ? 'User will be permanently deleted from the database' 
              : 'User will be soft-deleted (can be restored later)'}
          </div>
        </div>
        <Switch
          checked={isHardDelete}
          onCheckedChange={setIsHardDelete}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            if (onSuccess) {
              onSuccess()
            } else {
              router.push('/dashboard/admin/users')
            }
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deleting...' : 'Delete User'}
        </Button>
      </div>
    </div>
  )
} 