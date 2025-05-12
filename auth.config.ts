import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { loginFormSchema } from './schema/auth'
import { prisma } from './lib/db'
import { logActivity } from './lib/activity-logger'

const getClientInfo = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const userAgent = req.headers.get('user-agent') || undefined;
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : undefined;
  
  return { ipAddress, userAgent };
};

export default {
  providers: [
    Credentials({
      authorize: async (credentials, request) => {
        try {
          const validatedFields = loginFormSchema.safeParse(credentials)

          if (validatedFields.success) {
            try {
              const { email, password, totpCode } = validatedFields.data
              const { ipAddress, userAgent } = getClientInfo(request);

              const user = await prisma.user.findUnique({ 
                where: { email }, 
                include: { 
                  profile: true,
                  settings: true 
                } 
              })

              if (!user || !user.password) {
                // Log failed login attempt - user not found
                await logActivity({
                  user: email,
                  action: 'Login Attempt',
                  eventType: 'security',
                  severity: 'warning',
                  details: 'Failed login attempt - User not found',
                  ipAddress,
                  userAgent,
                  metadata: { reason: 'user_not_found' }
                });
                return null;
              }

              const isPasswordMatch = await bcrypt.compare(password, user.password)

              if (!isPasswordMatch) {
                // Log failed login attempt - wrong password
                await logActivity({
                  user: email,
                  action: 'Login Attempt',
                  eventType: 'security',
                  severity: 'warning',
                  details: 'Failed login attempt - Invalid credentials',
                  ipAddress,
                  userAgent,
                  metadata: { reason: 'invalid_credentials' }
                });
                return null;
              }

              // Check if 2FA is enabled
              const systemSettings = user.settings?.systemSettings as { twoFactorEnabled?: boolean } | undefined
              const twoFactorEnabled = systemSettings?.twoFactorEnabled ?? false

              if (twoFactorEnabled) {
                // If 2FA is enabled but no TOTP code provided
                if (!totpCode) {
                  throw new Error('2FA_REQUIRED')
                }

                try {
                  // Verify TOTP code using the API route
                  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/2fa/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token: totpCode })
                  })

                  const result = await response.json()

                  if (!result.success) {
                    await logActivity({
                      user: email,
                      action: 'Login Attempt',
                      eventType: 'security',
                      severity: 'warning',
                      details: 'Failed login attempt - Invalid 2FA code',
                      ipAddress,
                      userAgent,
                      metadata: { reason: 'invalid_2fa' }
                    });
                    throw new Error('INVALID_2FA_CODE')
                  }
                } catch (fetchError) {
                  console.error("2FA verification error:", fetchError);
                  throw new Error('2FA_VERIFICATION_ERROR');
                }
              }

              // Log successful login
              await logActivity({
                user: user.email,
                action: 'Login Success',
                eventType: 'security',
                severity: 'info',
                details: 'Successful login',
                ipAddress,
                userAgent,
                metadata: { userId: user.id }
              });

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            } catch (authError) {
              // Handle specific auth errors
              if (authError instanceof Error) {
                if (authError.message === '2FA_REQUIRED' || 
                    authError.message === 'INVALID_2FA_CODE' ||
                    authError.message === '2FA_VERIFICATION_ERROR') {
                  throw authError;
                }
              }
              
              console.error("User authentication error:", authError);
              return null;
            }
          }

          return null
        } catch (error) {
          // Throw specific errors for 2FA
          if (error instanceof Error) {
            if (error.message === '2FA_REQUIRED' || 
                error.message === 'INVALID_2FA_CODE' ||
                error.message === '2FA_VERIFICATION_ERROR') {
              throw error;
            }
          }

          // Log system error during login
          if (credentials && typeof credentials === 'object' && 'email' in credentials) {
            const { ipAddress, userAgent } = getClientInfo(request);
            await logActivity({
              user: credentials.email as string,
              action: 'Login Error',
              eventType: 'system',
              severity: 'error',
              details: 'System error during login attempt',
              ipAddress,
              userAgent,
              metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
          }
          console.error("Authorization error:", error);
          return null
        }
      }
    })
  ]
} satisfies NextAuthConfig
