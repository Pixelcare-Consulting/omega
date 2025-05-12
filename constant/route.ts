/**
 * An array of routes that are accessible to public.
 * These routes does not require authentication.
 * @type {string[]}
 */
export const publicRoutes = []

/**
 * An array of routes that are used for authentication.
 * These routes does not require authentication.
 * @type {string[]}
 */
export const authRoutes = ['/login']

/**
 * An array of routes that are accessible to authenticated users.
 * These routes requires authentication.
 * @type {string[]}
 */
export const protectedRoutes = ['/dashboard', '/crm', '/accounting']

/**
 * The prefix for all API routes that is used for authentication.
 * Routes that starts with this prefix are used for authentication.
 * @type {string}
 */
export const authApiPrefix = '/api/auth'

export const DEFAULT_LOGIN_REDIRECT = '/dashboard'
