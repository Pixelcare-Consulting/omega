import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { TwoFactorService } from "@/lib/2fa"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    const { secret, qrCode } = await TwoFactorService.generateSecret(session.user.id)

    return new NextResponse(
      JSON.stringify({ base32: secret, qrCode }),
      { status: 200 }
    )
  } catch (error) {
    console.error("[2FA_GENERATE_ERROR]", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate 2FA secret" }),
      { status: 500 }
    )
  }
} 