import 'next-auth/jwt'

import NextAuth, { NextAuthConfig } from 'next-auth'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import authConfig from './auth.config'
import { prisma } from './lib/db'
import { loginFormSchema } from './schema/auth'
import { getAccountByUserId, getUserById } from './actions/user'

// Define absolute minimal user type
export type ExtendedUser = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null // Required by adapter
  role: string | null
  avatarUrl?: string | null
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string
    name?: string | null
    email?: string | null
    role?: string | null
    avatarUrl?: string | null
  }
}

export const callbacks: NextAuthConfig['callbacks'] = {
  jwt: async ({ token, session, trigger, user: adapterUser }) => {
    try {
      // Initialize with minimal data from token claims
      if (adapterUser) {
        // Initial sign in
        token.sub = adapterUser.id || ''
        token.name = adapterUser.name
        token.email = adapterUser.email
        token.role = (adapterUser as any).role
        
        // Query only the avatar URL separately - avoid including profile in token
        const userProfile = await prisma.profile.findUnique({
          where: { userId: adapterUser.id },
          select: { details: true }
        });
        
        if (userProfile?.details) {
          const details = userProfile.details as Record<string, any>;
          token.avatarUrl = details.avatarUrl || null;
        }
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        // Only update specific fields to keep token small
        if (session.user.avatarUrl !== undefined) {
          token.avatarUrl = session.user.avatarUrl;
        }
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
      }

      return token
    } catch (error) {
      console.error("Error in JWT callback:", error);
      return token;
    }
  },
  
  session: async ({ token, session }) => {
    try {
      if (token && token.sub) {
        session.user = {
          id: token.sub,
          name: token.name || null,
          email: token.email || '',
          emailVerified: null, // Add this field to satisfy type requirements
          role: token.role || null,
          avatarUrl: token.avatarUrl || null
        }
      }
      return session
    } catch (error) {
      console.error("Error in session callback:", error);
      return session;
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 4 * 60 * 60, // 4 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  callbacks,
  pages: {
    signIn: '/login',
    error: '/auth-error'
  },
  debug: false, // Disable debug to reduce token size from logs
  logger: {
    error(error: Error) {
      console.error(`Auth error:`, error);
    },
    warn(code: string) {
      if (code !== 'debug-enabled') {
        console.warn(`Auth warning (${code})`);
      }
    }
  },
  ...authConfig
})