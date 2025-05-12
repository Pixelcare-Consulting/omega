import { NextResponse } from "next/server"
import { TwoFactorService } from "@/lib/2fa"

// Opt out of Edge Runtime
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the token
    const isValid = await TwoFactorService.verifyLoginToken(email, token)

    return NextResponse.json({ 
      success: isValid,
      error: isValid ? null : "Invalid verification code"
    })

  } catch (error) {
    console.error("[2FA_VERIFY_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    )
  }
} 