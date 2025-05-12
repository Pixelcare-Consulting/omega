'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createUser, updateUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean().default(true),
})

// Define the form data type
type FormData = {
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
}

interface UserFormProps {
  user?: User & { profile: any } | null;
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function UserForm({ user, onSuccess, isModal = false }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'USER',
      isActive: user?.isActive ?? true,
    },
  })

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true)
      setError(null)

      if (user) {
        // Update existing user
        const formData = { ...data }
        // If password is empty, remove it from form data
        if (!formData.password) {
          delete formData.password
        }
        // Password hashing is now handled in the server action
        await updateUser(user.id, formData as any)
      } else {
        // Create new user
        if (!data.password) {
          setError('Password is required for new users')
          setIsSubmitting(false)
          return
        }
        
        // Password hashing is now handled in the server action
        
        // Add defaults for missing required fields
        const fullUserData = {
          ...data,
          emailVerified: null,
          profileId: null,
          isOnline: false,
          lastActiveAt: null,
          deletedAt: null,
          createdBy: null,
          updatedBy: null,
          deletedBy: null
        }
        await createUser(fullUserData as any)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if we need to show the cancel button
  const showCancelButton = !isModal || !!user

  return (
    <div className={isModal ? undefined : "bg-white shadow rounded-md p-6"}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user ? 'Password (leave blank to keep current)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="supply-chain">Supply Chain</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? 'User is active' : 'User is inactive'}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            {showCancelButton && (
              <Button
                type="button"
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
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 