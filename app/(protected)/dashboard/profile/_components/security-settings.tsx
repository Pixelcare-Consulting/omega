"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Key, Smartphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { updatePassword } from "../_actions/profile"
import { useSession } from "next-auth/react"
import type { ExtendedUser } from "@/types/next-auth"
import { TwoFactorSetup } from "./two-factor-setup"

const securityFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    }
  ),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecuritySettings() {
  const { toast } = useToast()
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Load 2FA settings
  useEffect(() => {
    const loadTwoFactorSettings = async () => {
      try {
        const user = session?.user as ExtendedUser | undefined
        const enabled = user?.settings?.systemSettings?.twoFactorEnabled ?? false
        setTwoFactorEnabled(enabled)
      } catch (error) {
        console.error("Failed to load 2FA settings:", error)
        toast({
          title: "Error",
          description: "Failed to load 2FA settings. Please try again later.",
          variant: "destructive",
        })
      }
    }

    if (session?.user) {
      loadTwoFactorSettings()
    }
  }, [session, toast])

  async function onSubmit(data: SecurityFormValues) {
    setIsLoading(true)
    try {
      const result = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update session after password change
      await updateSession()

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorChange = async (enabled: boolean) => {
    if (enabled) {
      // Show setup dialog when enabling
      setShowTwoFactorSetup(true)
      return
    }

    // Handle disabling 2FA
    setIsTwoFactorLoading(true)
    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Update session to reflect new 2FA status
      await updateSession()
      setTwoFactorEnabled(false)

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disable 2FA",
        variant: "destructive",
      })
      // Revert the switch if there was an error
      setTwoFactorEnabled(true)
    } finally {
      setIsTwoFactorLoading(false)
    }
  }

  const handleSetupSuccess = async () => {
    setShowTwoFactorSetup(false)
    setTwoFactorEnabled(true)
    await updateSession()
  }

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-red-500" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your current password" 
                        type="password" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Choose a new password" 
                        type="password" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long and contain uppercase, lowercase, number and special characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirm your new password" 
                        type="password" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-red-500 hover:bg-red-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-red-500" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Secure your account with 2FA authentication
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorChange}
              disabled={isTwoFactorLoading}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
          {twoFactorEnabled && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Two-factor authentication is enabled. You will need to enter a code from your authenticator app when signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <TwoFactorSetup
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        onSuccess={handleSetupSuccess}
      />
    </div>
  )
} 