import Link from 'next/link'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'
import UserContent from './_components/user-content'

export default function UsersPage() {
  return (
    <ContentLayout title='User Management'>
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
            <BreadcrumbLink asChild>
              <Link href='/dashboard/admin/settings'>Settings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CardContent className='p-6'>
          <div className='flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] min-w-full justify-center'>
            <UserContent />
          </div>
        </CardContent>
    </ContentLayout>
  )
} 