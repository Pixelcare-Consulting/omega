import SettingsConfig from './_components/settings-config';
import Link from 'next/link'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'

export default function SettingsPage() {
  return (
    <ContentLayout title='Settings'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CardContent className='p-6'>
          <div className='flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] min-w-full justify-center'>
            <SettingsConfig />
          </div>
        </CardContent>
    </ContentLayout>
  )
} 
