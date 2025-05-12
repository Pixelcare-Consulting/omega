import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { TwoFactorService } from "@/lib/2fa"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    const body = await req.json()
    const { token, secret } = body

    if (!token || !secret) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      )
    }

    // First verify the token
    const isValid = await TwoFactorService.verifyToken(session.user.id, token)
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 400 }
      )
    }

    // If valid, enable 2FA
    const result = await TwoFactorService.enableTwoFactor(session.user.id, token)
    if (!result) {
      throw new Error("Failed to enable 2FA")
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (error) {
    console.error("[2FA_VERIFY_ERROR]", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to verify and enable 2FA" }),
      { status: 500 }
    )
  }
} 