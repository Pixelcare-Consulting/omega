import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { logActivity } from "@/lib/activity-logger"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    // Update user settings
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: {
        systemSettings: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorTempSecret: null,
        },
      },
    })

    // Log the activity
    await logActivity({
      action: "2FA Disabled",
      user: session.user.id,
      eventType: "security",
      severity: "info",
      details: "Two-factor authentication disabled",
    })

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (error) {
    console.error("[2FA_DISABLE_ERROR]", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to disable 2FA" }),
      { status: 500 }
    )
  }
} 