'use client'

import { useSidebar } from '@/hooks/use-sidebar'
import { useStore } from '@/hooks/use-store'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Footer } from './footer'
import { ExtendedUser } from '@/auth'

export default function PanelLayout({ user, children }: { user?: ExtendedUser; children: React.ReactNode }) {
  const sidebar = useStore(useSidebar, (x) => x)

  if (!sidebar || !user) return null

  const { getOpenState, settings } = sidebar

  return (
    <>
      <Sidebar user={user} />
      <main
        className={cn(
          'min-h-[calc(100vh_-_56px)] bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900',
          !settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72')
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          'transition-[margin-left] duration-300 ease-in-out',
          !settings.disabled && (!getOpenState() ? 'lg:ml-[90px]' : 'lg:ml-72')
        )}
      >
        <Footer />
      </footer>
    </>
  )
}
