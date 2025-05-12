import * as z from 'zod'

//* Zod Schema
export const loginFormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  }),
  totpCode: z.string().optional(),
  callbackUrl: z.string().nullable().optional(),
  isAdminBypass: z.boolean().optional()
})

//* Types
export type LoginForm = z.infer<typeof loginFormSchema>

export interface LoginResponse {
  success?: boolean;
  error?: string;
  message?: string;
  user?: {
    role?: string;
  };
  code?: number;
  action?: string;
}
