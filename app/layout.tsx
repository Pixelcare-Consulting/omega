import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/provider/theme-provider"
import TailwindIndicatorProvider from "@/components/provider/tailwind-indicator-provider"
import ToastProvider from "@/components/provider/toast-provider"
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react"
import { getMetadata } from "@/app/lib/metadata"
import { registerSyncfusionLicense } from "@/lib/syncfusion-license"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "@/components/ui/toaster"
import ACLGuardProvider from "@/components/provider/acl-guard-provider"

// Register Syncfusion license
registerSyncfusionLicense()

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  adjustFontFallback: false,
  variable: "--font-inter",
})

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata()
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html className='h-full scroll-smooth' lang='en' suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <SessionProvider session={session}>
          <NextTopLoader
            color='#FF0000'
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing='ease'
            speed={200}
            template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={1600}
            showAtBottom={false}
          />
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem={true} disableTransitionOnChange storageKey='omega-theme'>
            <ACLGuardProvider session={session}>{children}</ACLGuardProvider>
            <TailwindIndicatorProvider />
          </ThemeProvider>
          <ToastProvider />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
