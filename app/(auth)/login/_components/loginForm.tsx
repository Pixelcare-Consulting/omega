'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useAction } from 'next-safe-action/hooks'

import Alert from '@/components/alert'
import { Form } from '@/components/ui/form'
import InputField from '@/components/form/input-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginForm, loginFormSchema } from '@/schema/auth'
import { loginUser } from '@/actions/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingButton from '@/components/loading-button'
import { Icons } from '@/components/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DEFAULT_LOGIN_REDIRECT } from '@/constant/route'

//* Loading tips to show during authentication
const LOADING_TIPS = [
  'Ensuring a secure connection...',
  'Verifying your credentials...',
  'Checking account status...',
  'Preparing your workspace...',
  'Connecting to external services...',
  'Almost there...'
] as const

type AuthStatusModalProps = {
  isOpen: boolean
  status: 'loading' | 'success' | 'error'
  message: string
  onClose: () => void
  redirectUrl?: string
}

//* Auth Status Modal Component
const AuthStatusModal = ({ isOpen, status, message, onClose, redirectUrl }: AuthStatusModalProps) => {
  const [countdown, setCountdown] = useState(5)
  const [currentTip, setCurrentTip] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout
    let tipTimer: NodeJS.Timeout

    if (status === 'loading' && isOpen) {
      //* Progress animation
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev //* Cap at 90% until success
          return prev + Math.random() * 15
        })
      }, 500)

      //* Rotate through tips
      tipTimer = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length)
      }, 2000)
    } else if (status === 'success' && isOpen) {
      setProgress(100)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)

            // //* Redirect to callback URL
            if (redirectUrl) window.location.assign(redirectUrl)

            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setProgress(0)
      setCurrentTip(0)
      setCountdown(5)
    }

    return () => {
      if (timer) clearInterval(timer)
      if (progressTimer) clearInterval(progressTimer)
      if (tipTimer) clearInterval(tipTimer)
    }
  }, [status, isOpen, redirectUrl])

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent
        className='border-none bg-background/95 shadow-lg backdrop-blur-md dark:bg-gray-900/95 sm:max-w-md'
        onInteractOutside={status === 'loading' ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader className='pb-2'>
          <DialogTitle className={`text-center text-xl ${status === 'success' ? 'text-primary' : ''}`}>
            {status === 'loading' ? 'Authenticating...' : status === 'success' ? 'Welcome Back!' : 'Authentication Error'}
          </DialogTitle>
          <DialogDescription className='pt-1 text-center'>{message}</DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-center pb-2'>
          {status === 'loading' && (
            <div className='flex flex-col items-center gap-6'>
              {/* Elegant spinner with Omega branding */}
              <div className='relative h-24 w-24'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='h-16 w-16 rounded-full border-2 border-gray-100 dark:border-gray-800'></div>
                  <div className='absolute h-20 w-20 animate-spin rounded-full border-t-2 border-primary'></div>
                </div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Icons.dashboard className='size-8 animate-pulse text-primary' />
                </div>
              </div>

              {/* Loading tip */}
              <div className='space-y-2 text-center'>
                <p className='animate-fade-in animate-pulse text-sm text-primary'>{LOADING_TIPS[currentTip]}</p>
              </div>

              {/* Progress indication */}
              <div className='w-full max-w-[200px] space-y-2'>
                <div className='h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
                  <div className='h-full bg-primary transition-all duration-300 ease-out' style={{ width: `${progress}%` }} />
                </div>
                <p className='text-center text-xs text-muted-foreground'>{Math.round(progress)}% Complete</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className='flex flex-col items-center gap-6'>
              {/* Success animation */}
              <div className='relative flex h-24 w-24 items-center justify-center'>
                <div className='absolute inset-0 rounded-full border-4 border-green-100 dark:border-green-900/30'></div>
                <div className='absolute h-full w-full animate-ping rounded-full bg-green-100 opacity-20 dark:bg-green-700/20'></div>
                <div className='rounded-full bg-green-50 p-4 animate-in zoom-in-50 dark:bg-green-900/30'>
                  <Icons.checkCircle className='size-10 text-green-500' />
                </div>
              </div>

              {/* Success message */}
              <div className='space-y-2 text-center'>
                <p className='text-sm font-medium'>Login successful! Your dashboard is ready.</p>
                <p className='text-xs text-muted-foreground'>Redirecting in {countdown} seconds...</p>
              </div>

              {/* Action buttons */}
              <div className='flex w-full gap-2'>
                <Button className='flex-1' onClick={onClose}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className='flex flex-col items-center gap-6'>
              {/* Error animation */}
              <div className='relative flex h-24 w-24 items-center justify-center'>
                <div className='absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900/30'></div>
                <div className='rounded-full bg-red-50 p-4 animate-in zoom-in-50 dark:bg-red-900/30'>
                  <Icons.circleAlert className='size-10 text-red-500' />
                </div>
              </div>

              {/* Action buttons */}
              <Button className='w-full' variant='outline' onClick={onClose}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface LoginResponse {
  success?: boolean
  error?: string
  message?: string
  user?: {
    role?: string
  }
  code?: number
  action?: string
  redirectUrl?: string
}

interface ActionResponse {
  data?: LoginResponse
  error?: string
}

const SigninForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [showTotpInput, setShowTotpInput] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    status: 'loading' | 'success' | 'error'
    message: string
  }>({
    isOpen: false,
    status: 'loading',
    message: ''
  })

  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || DEFAULT_LOGIN_REDIRECT

  const form = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      callbackUrl,
      totpCode: ''
    },
    resolver: zodResolver(loginFormSchema)
  })

  const { executeAsync, isExecuting } = useAction(loginUser)

  const handleSubmit = async (formValues: LoginForm) => {
    setError('')
    setError('')
    setSuccess('')

    //* Show loading modal
    setModalState({
      isOpen: true,
      status: 'loading',
      message: 'Signing in...' // Initial message
    })

    try {
      const response = (await executeAsync(formValues)) as ActionResponse
      const result = response?.data

      //* Handle connection errors
      if (response?.error) {
        setModalState({
          isOpen: true,
          status: 'error',
          message: `Connection error: ${response.error}`
        })
        setError(response.error)
        return
      }

      //* Check for success
      if (result?.success) {
        //* Show success modal
        setModalState({
          isOpen: true,
          status: 'success',
          message: `Welcome back, ${formValues.email.split('@')[0]}!`
        })

        setSuccess('Successfully logged in!')
        form.reset()

        //* We don't actually redirect here, just set it for the modal close handler
        return
      }

      //* Handle errors
      if (result?.error) {
        //* Handle 2FA required for non-admin users
        if (result.message === '2FA Code required!' || result.message === '2FA_REQUIRED') {
          setShowTotpInput(true)
          setModalState({ isOpen: false, status: 'loading', message: '' }) // Close modal for 2FA input
          setError('Please enter your two-factor authentication code.')
          return
        }

        //* Handle invalid 2FA code
        if (result.message === 'Invalid authentication code. Please try again.' || result.message === 'INVALID_2FA_CODE') {
          setError('Invalid authentication code. Please try again.')
          setModalState({ isOpen: false, status: 'loading', message: '' }) // Close modal for invalid 2FA
          return
        }

        //* Handle other errors
        setError(result.message || 'Authentication failed')
        setModalState({
          isOpen: true,
          status: 'error',
          message: result.message || 'Authentication failed. Please verify your credentials and try again.'
        })
      } else {
        //* Unexpected response format
        setError('Unexpected response from server')
        setModalState({
          isOpen: true,
          status: 'error',
          message: 'Unexpected response from the authentication server. Please try again.'
        })
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong!'
      setError(errorMessage)
      setModalState({
        isOpen: true,
        status: 'error',
        message: 'Connection error. Please check your internet connection and try again.'
      })
    }
  }

  const handleModalClose = () => {
    //* If success, always redirect regardless of previous state
    if (modalState.status === 'success') window.location.assign(callbackUrl)
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col items-center gap-3 text-center'>
        <h1 className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl'>
          Welcome Back
        </h1>
        <p className='text-balance text-sm text-muted-foreground'>Enter your credentials to access your account</p>
      </div>

      <Alert variant='success' message={success} className='animate-in fade-in-50 slide-in-from-top-5' />
      <Alert variant='error' message={error} className='animate-in fade-in-50 slide-in-from-top-5' />

      <Form {...form}>
        <form id='login-form' className='flex flex-col gap-6' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='space-y-4'>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{
                inputProps: {
                  placeholder: 'm@example.com',
                  className: 'h-11'
                }
              }}
            />

            <div className='space-y-1'>
              <InputField
                control={form.control}
                name='password'
                label='Password'
                extendedProps={{
                  inputProps: {
                    placeholder: '••••••••',
                    type: 'password',
                    className: 'h-11'
                  }
                }}
              />

              <div className='flex items-center justify-end'>
                <Button asChild className='h-auto px-0 font-normal hover:text-primary' variant='link'>
                  <Link href='/forgot-password' className='text-xs'>
                    Forgot Password?
                  </Link>
                </Button>
              </div>
            </div>

            {showTotpInput && (
              <div className='space-y-1'>
                <InputField
                  control={form.control}
                  name='totpCode'
                  label='Authentication Code'
                  extendedProps={{
                    inputProps: {
                      placeholder: 'Enter 6-digit code',
                      type: 'text',
                      maxLength: 6,
                      className: 'h-11 text-center tracking-widest'
                    }
                  }}
                />
                <p className='text-center text-xs text-muted-foreground'>Enter the 6-digit code from your authenticator app</p>
              </div>
            )}

            <LoadingButton
              type='submit'
              className='h-11 w-full gap-2 text-base font-medium'
              isLoading={isExecuting}
              loadingText='Signing in...'
            >
              {!isExecuting && <Icons.login className='size-4' />}
              Sign in
            </LoadingButton>
          </div>
        </form>
      </Form>

      <div className='text-center'>
        <span className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Button asChild variant='link' className='h-auto p-0 text-sm font-normal hover:text-primary'>
            <Link href='/register'>Create an account</Link>
          </Button>
        </span>
      </div>

      {/* Auth Status Modal */}
      <AuthStatusModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
        redirectUrl={callbackUrl}
      />
    </div>
  )
}

export default SigninForm
