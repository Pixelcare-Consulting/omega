import { Suspense } from 'react'
import LoginForm from './_components/loginForm'
import { Icons } from '@/components/icons'

const SigninPage = () => {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative flex flex-col gap-4 p-6 md:p-10 bg-white dark:bg-gray-950'>
        {/* Subtle decorative elements */}
        <div className='pointer-events-none fixed inset-0 lg:absolute'>
          <div className='absolute -left-4 top-0 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[80px]' />
          <div className='absolute right-0 bottom-0 h-[200px] w-[200px] rounded-full bg-primary/3 blur-[60px]' />
        </div>
        
        {/* Subtle grid pattern */}
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[length:32px_32px] opacity-70'></div>

        <div className='relative flex justify-center gap-2 md:justify-start'>
          <a 
            href='/' 
            className='group flex items-center gap-2.5 font-medium transition-colors hover:text-primary'
          >
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/10 ring-1 ring-primary/5 transition-transform group-hover:scale-105 dark:shadow-primary/5'>
              <Icons.dashboard className='size-5' />
            </div>
            <span className='text-xl font-semibold tracking-tight'>Omega</span>
          </a>
        </div>

        <div className='relative flex flex-1 items-center justify-center'>
          <div className='w-full max-w-sm space-y-6'>
            {/* Card with subtle border and shadow */}
            <div className='rounded-xl border border-gray-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/50'>
              <Suspense 
                fallback={
                  <div className='flex flex-col gap-8 animate-pulse'>
                    {/* Header skeleton */}
                    <div className='flex flex-col items-center gap-3 text-center'>
                      <div className='h-8 w-48 rounded-lg bg-muted'></div>
                      <div className='h-4 w-64 rounded bg-muted'></div>
                    </div>

                    {/* Form skeleton */}
                    <div className='space-y-6'>
                      <div className='space-y-2'>
                        <div className='h-4 w-16 rounded bg-muted'></div>
                        <div className='h-11 w-full rounded-md bg-muted'></div>
                      </div>
                      <div className='space-y-2'>
                        <div className='h-4 w-20 rounded bg-muted'></div>
                        <div className='h-11 w-full rounded-md bg-muted'></div>
                        <div className='flex justify-end'>
                          <div className='h-4 w-24 rounded bg-muted'></div>
                        </div>
                      </div>
                      <div className='h-11 w-full rounded-md bg-muted'></div>
                    </div>

                    {/* Footer skeleton */}
                    <div className='flex justify-center'>
                      <div className='h-4 w-48 rounded bg-muted'></div>
                    </div>
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>
            
            {/* Subtle footer */}
            <div className='text-center text-xs text-muted-foreground'>
              <p>© {new Date().getFullYear()} Omega. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle elegant separator */}
      <div className='hidden lg:block absolute left-1/2 top-0 bottom-0 z-10 w-[1px] -translate-x-1/2 overflow-hidden'>
        <div className='absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent'></div>
      </div>

      <div className='relative hidden overflow-hidden bg-black lg:block'>
        {/* Dark overlay for better image visibility */}
        <div className='absolute inset-0 bg-black/60' />
        
        {/* Hero image */}
        <img
          src='https://images.unsplash.com/photo-1665686376173-ada7a0031a85?q=80&w=1470&auto=format&fit=crop'
          alt='Login hero'
          className='absolute inset-0 h-full w-full object-cover'
        />
        
        {/* Subtle vignette effect */}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40' />
        <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60' />
        
        {/* Fine texture overlay */}
        <div className='absolute inset-0 bg-[url(/noise.png)] opacity-[0.03] mix-blend-overlay'></div>
        
        {/* Content */}
        <div className='relative flex h-full flex-col items-center justify-center p-8 text-center'>
          <div className='max-w-xl space-y-4'>
            {/* Logo accent */}
            
            <h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl'>
              Welcome to <span className='text-primary'>Omega</span>
            </h1>
            <p className='text-lg text-zinc-300'>
              Your all-in-one solution for modern business management
            </p>
            
            {/* Feature list */}
            <div className='mt-8 rounded-xl bg-black/30 p-6 backdrop-blur-sm'>
              <ul className='grid gap-4 text-left text-sm text-zinc-300'>
                <li className='flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/20'>
                    <Icons.check className='size-3.5 text-primary' />
                  </div>
                  Streamlined workflow management
                </li>
                <li className='flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/20'>
                    <Icons.check className='size-3.5 text-primary' />
                  </div>
                  Real-time analytics and reporting
                </li>
                <li className='flex items-center gap-2'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/20'>
                    <Icons.check className='size-3.5 text-primary' />
                  </div>
                  Secure and scalable infrastructure
                </li>
              </ul>
            </div>
            
            {/* Subtle tag line */}
            <p className='mt-6 text-xs tracking-wide text-zinc-500'>PRECISION. PERFORMANCE. PRESTIGE.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SigninPage
