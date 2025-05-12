import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { prisma } from '@/lib/db'

interface SystemSettings {
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorTempSecret: string | null;
  [key: string]: any; // Allow other system settings
}

interface UserSettingsData {
  userId: string;
  systemSettings: SystemSettings;
}

export class TwoFactorService {
  static async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `Omega:${userId}`,
      issuer: 'Omega'
    })

    // Store the secret in the database
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        systemSettings: {
          twoFactorEnabled: false,
          twoFactorSecret: secret.base32,
          twoFactorTempSecret: secret.base32
        }
      },
      update: {
        systemSettings: {
          twoFactorTempSecret: secret.base32
        }
      }
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '')

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    }
  }

  static async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.userSettings.findUnique({
      where: { userId }
    })

    if (!user?.systemSettings) return false

    const settings = user.systemSettings as SystemSettings
    // If 2FA is being set up, verify against temp secret
    const secret = settings.twoFactorSecret || settings.twoFactorTempSecret

    if (!secret) return false

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 intervals before/after for clock drift
    })
  }

  static async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyToken(userId, token)

    if (!isValid) return false

    const user = await prisma.userSettings.findUnique({
      where: { userId }
    })

    if (!user?.systemSettings) return false

    const currentSettings = user.systemSettings as SystemSettings

    // Move temp secret to permanent secret and enable 2FA
    await prisma.userSettings.update({
      where: { userId },
      data: {
        systemSettings: {
          ...currentSettings,
          twoFactorEnabled: true,
          twoFactorSecret: currentSettings.twoFactorTempSecret,
          twoFactorTempSecret: null
        }
      }
    })

    return true
  }

  static async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyToken(userId, token)

    if (!isValid) return false

    await prisma.userSettings.update({
      where: { userId },
      data: {
        systemSettings: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorTempSecret: null
        }
      }
    })

    return true
  }

  static async validateLogin(userId: string, token: string): Promise<boolean> {
    const user = await prisma.userSettings.findUnique({
      where: { userId }
    })

    if (!user?.systemSettings) return true
    
    const settings = user.systemSettings as SystemSettings
    if (!settings.twoFactorEnabled) return true
    
    return this.verifyToken(userId, token)
  }

  static async verifyLoginToken(email: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    })

    if (!user?.settings?.systemSettings) return false
    
    const settings = user.settings.systemSettings as SystemSettings
    if (!settings.twoFactorEnabled || !settings.twoFactorSecret) return false
    
    return speakeasy.totp.verify({
      secret: settings.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    })
  }

  static async isTwoFactorEnabled(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    })

    if (!user?.settings?.systemSettings) return false
    
    const settings = user.settings.systemSettings as SystemSettings
    return settings.twoFactorEnabled || false
  }
} 