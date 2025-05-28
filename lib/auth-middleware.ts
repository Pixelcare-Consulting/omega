'use server'

import NextAuth from 'next-auth';
import authConfig from '../auth.config';
import { callbacks } from '../auth'; // Import callbacks from the original auth.ts

// This file contains the authentication logic specifically for the middleware.
// It should not import any Node.js-specific modules or server-only code.

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    session: callbacks?.session // Use the session callback from the original auth.ts
  }
});

export default auth;
