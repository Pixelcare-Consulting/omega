"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-logger"
import bcrypt from "bcryptjs"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function updateProfile(values: {
  name: string
  email: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: values.name,
        email: values.email,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
    })

    // Update or create profile details
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        details: {
          name: values.name,
          email: values.email,
        },
        createdBy: session.user.id,
      },
      update: {
        details: {
          name: values.name,
          email: values.email,
        },
        updatedBy: session.user.id,
      },
    })

    // Log the activity
    await logActivity({
      action: "Profile Updated",
      user: session.user.id,
      eventType: "user",
      severity: "info",
      details: `Profile updated for user ${values.email}`,
      metadata: { name: values.name, email: values.email },
    })

    revalidatePath("/dashboard/profile")
    return { success: true, data: user }
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function updatePassword(values: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Verify current password
    const isValid = await bcrypt.compare(values.currentPassword, user.password || "")
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(values.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
    })

    // Log the activity
    await logActivity({
      action: "Password Changed",
      user: session.user.id,
      eventType: "security",
      severity: "info",
      details: "User password was changed",
    })

    return { success: true }
  } catch (error) {
    console.error("[PASSWORD_UPDATE_ERROR]", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function updateTwoFactorAuth(enabled: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Update user settings
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        systemSettings: {
          twoFactorEnabled: enabled,
        },
      },
      update: {
        systemSettings: {
          twoFactorEnabled: enabled,
        },
      },
    })

    // Log the activity
    await logActivity({
      action: enabled ? "2FA Enabled" : "2FA Disabled",
      user: session.user.id,
      eventType: "security",
      severity: "info",
      details: `Two-factor authentication ${enabled ? "enabled" : "disabled"}`,
    })

    return { success: true }
  } catch (error) {
    console.error("[2FA_UPDATE_ERROR]", error)
    return { success: false, error: "Failed to update 2FA settings" }
  }
}

export async function updateProfilePicture(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      throw new Error("No file provided")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please upload an image.")
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 5MB.")
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate a unique filename
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${session.user.id}-${uuidv4()}.${extension}`
    
    // Make sure the uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    await mkdir(uploadDir, { recursive: true })
    
    // Write the file to disk
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    
    // Create a URL path for the image (relative to public directory)
    const imageUrl = `/uploads/profiles/${fileName}`

    // Get current profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    // Current profile details
    const currentDetails = currentProfile?.details as Record<string, any> || {}

    // Update profile with new image URL instead of base64 data
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        details: {
          avatarUrl: imageUrl,
          name: session.user.name,
          email: session.user.email
        },
        createdBy: session.user.id,
      },
      update: {
        details: {
          ...currentDetails,
          avatarUrl: imageUrl
        },
        updatedBy: session.user.id,
      },
    })

    // Log the activity
    await logActivity({
      action: "Profile Picture Updated",
      user: session.user.id,
      eventType: "user",
      severity: "info",
      details: "Profile picture updated",
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")
    
    return { success: true, avatarUrl: imageUrl }
  } catch (error) {
    console.error("[PROFILE_PICTURE_UPDATE_ERROR]", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile picture" }
  }
} 