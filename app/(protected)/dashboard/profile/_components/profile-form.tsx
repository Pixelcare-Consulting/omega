"use client"

import { useEffect, useState, useRef } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Camera, User, Pencil, Loader2 } from "lucide-react"
import { updateProfile, updateProfilePicture } from "../_actions/profile"
import { useSession } from "next-auth/react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { toast } = useToast()
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-avatar.png")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || "",
        email: session.user.email || "",
      })
      
      // Set avatar URL directly from user
      if (session.user.avatarUrl) {
        setAvatarUrl(session.user.avatarUrl)
      }
    }
  }, [session, form])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      const result = await updateProfile(data)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update the session to reflect the changes
      await updateSession()

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
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

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Add timestamp to force image refresh when updating
    const timestamp = Date.now()
    
    setIsUploading(true)
    try {
      // Create FormData and append file
      const formData = new FormData()
      formData.append("file", file, file.name)

      const result = await updateProfilePicture(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update avatar preview with cache-busting timestamp
      if (result.avatarUrl) {
        setAvatarUrl(`${result.avatarUrl}?t=${timestamp}`)
      }
      
      // Update session to reflect changes
      await updateSession()

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      })
    } catch (error) {
      console.error("[AVATAR_UPLOAD_ERROR]", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile picture.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input value to allow uploading the same file again
      event.target.value = ''
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Profile Picture Section */}
      <Card className="md:col-span-4 border-none shadow-none bg-gray-50/50 dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-red-500" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Choose a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="relative group">
            <div 
              className="relative cursor-pointer"
              onClick={!isUploading ? triggerFileInput : undefined}
            >
              <Avatar className="h-40 w-40 border-4 border-background shadow-2xl">
                <AvatarImage src={avatarUrl} alt="Profile picture" className="object-cover" />
                <AvatarFallback className="bg-red-100 dark:bg-red-900">
                  <User className="h-16 w-16 text-red-500" />
                </AvatarFallback>
              </Avatar>
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="p-3 rounded-full hover:bg-white/20 transition-colors">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="hidden"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isUploading ? "Uploading..." : "Click the image to upload a new profile picture"}
          </p>
        </CardContent>
      </Card>

      {/* Profile Information Section */}
      <div className="space-y-6 md:col-span-8">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-red-500" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your email address will be used for notifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-red-500 hover:bg-red-600 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 