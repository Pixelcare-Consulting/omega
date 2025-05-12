import { getCurrentUser } from '@/actions/auth'
import { Navbar } from './navbar'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ContentLayoutProps {
  title: string
  children: React.ReactNode
}

// Navbar skeleton for loading state
function NavbarSkeleton() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Skeleton className="h-9 w-full md:w-64" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function ContentLayout({ title, children }: ContentLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar title={title} user={user || undefined} />
      </Suspense>
      <div className='container-fluid px-2 pb-4 pt-4 sm:px-8 max-w-[2000px] mx-auto'>{children}</div>
    </div>
  )
}
