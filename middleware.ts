import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

import { callbacks } from '@/auth'
import authConfig from './auth.config'
import { authApiPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, protectedRoutes } from './constant/route'

//? The @auth/prisma-adapter version ^2.8.0 is not compatible with next-auth version ^5.0.0-beta.25. To resolve this issue, revert to @auth/prisma-adapter version 2.7.2
//? Current Version of Prisma Adapter: 2.7.2

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isApiAuthRoute = nextUrl.pathname.startsWith(authApiPrefix);
      const isAuthRoute = authRoutes.includes(nextUrl.pathname);
      const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
      const isRootPage = nextUrl.pathname === '/';
      
      // We don't need to authenticate for API auth routes
      if (isApiAuthRoute) return true;
      
      const isLoggedIn = !!auth?.user;
      
      // For login page, redirect logged in users to dashboard
      if (isAuthRoute) {
        return isLoggedIn ? NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl)) : true;
      }
      
      // For protected routes, redirect non-logged in users to login
      if (isProtectedRoute && !isLoggedIn) {
        const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;
        const loginUrl = new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl);
        return NextResponse.redirect(loginUrl);
      }
      
      // For root, redirect to appropriate page
      if (isRootPage) {
        return isLoggedIn 
          ? NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
          : NextResponse.redirect(new URL('/login', nextUrl));
      }
      
      // All other routes can proceed
      return true;
    },
    // Keep the session callback for middleware
    session: callbacks?.session
  }
})

export default auth

export const config = {
  //* The following matcher runs middleware on all routes
  //* except static assets.
  //* This matcher is from clerk
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}