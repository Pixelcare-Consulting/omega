'use server'

import { auth, signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { cookies } from 'next/headers'

import { getUserByEmail } from './user'
import { action } from '@/lib/safe-action'
import { loginFormSchema } from '@/schema/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/constant/route'

export async function getCurrentUser() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      console.log("No active session or user data found");
      return null;
    }
    
    // Log successful session retrieval
    console.log(`Session retrieved for user: ${session.user.email}`);
    return session.user;
  } catch (error) {
    console.error("Error retrieving current user session:", error);
    return null;
  }
}

async function cleanupSessionTokens() {
  try {
    const cookieStore = await cookies()
    const sessionTokens = cookieStore.getAll()
      .filter(cookie => cookie.name.startsWith('authjs.session-token'))
    
    // Keep only the most recent token
    sessionTokens.slice(1).forEach(cookie => {
      cookieStore.delete(cookie.name)
    })
    
    if (sessionTokens.length > 1) {
      console.log(`Cleaned up ${sessionTokens.length - 1} old session tokens`);
    }
  } catch (error) {
    console.error("Error cleaning up session tokens:", error);
  }
}

export const loginUser = action.schema(loginFormSchema).action(async ({ parsedInput: data }) => {
  const { email, password, callbackUrl } = data

  try {
    const user = await getUserByEmail(email)

    if (!user || !user.email || !user.password) {
      return { 
        error: true, 
        code: 401, 
        message: 'User does not exist!', 
        action: 'SIGNIN_USER' 
      }
    }

    // Clean up any existing session tokens
    await cleanupSessionTokens()
    
    try {
      // IMPORTANT: DO NOT use redirectTo here, let the client handle redirects
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false // Don't redirect automatically from server
      })
      
      if (result?.error) {
        return { 
          error: true, 
          code: 401, 
          message: result.error || 'Authentication failed', 
          action: 'SIGNIN_USER' 
        }
      }
      
      return { 
        success: true, 
        message: 'Login successful!',
        redirectUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        action: 'SIGNIN_USER'
      }
    } catch (signInError) {
      if (signInError instanceof AuthError) {
        const authError = signInError as any

        console.error("Authentication error:", { 
          code: authError?.code,
          message: authError?.message,
          cause: authError?.cause
        });

        switch (authError?.code) {
          case 'credentials':
            return { error: true, code: 401, message: 'Invalid Credentials!', action: 'SIGNIN_USER' }
          case '2fa_required':
            return { error: true, code: 401, message: '2FA Code required!', action: 'SIGNIN_USER' }
          default:
            return { error: true, code: 500, message: 'Failed to login! Please try again later.', action: 'SIGNIN_USER' }
        }
      }
      
      console.error("Sign-in error:", signInError);
      return { 
        error: true, 
        code: 500, 
        message: signInError instanceof Error ? signInError.message : 'Connection error during authentication', 
        action: 'SIGNIN_USER' 
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    return { 
      error: true, 
      code: 500, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred', 
      action: 'SIGNIN_USER'
    }
  }
})
