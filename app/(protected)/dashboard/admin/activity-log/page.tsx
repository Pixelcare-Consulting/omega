import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { ActivityLogFilters } from './_components/activity-log-filters';
import { ActivityLogTable } from './_components/activity-log-table';
import { ActivityLogHeader } from './_components/activity-log-header';
import { ActivityLog } from './_components/columns';
import Link from 'next/link'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'

export default async function ActivityLogPage() {
  // Fetch initial activity logs data from your database
  const initialData = await prisma.activityLog.findMany({
    where: {
      eventType: {
        in: ['user', 'system', 'security', 'data']
      },
      severity: {
        in: ['info', 'warning', 'error', 'critical']
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 10
  }) as unknown as ActivityLog[];
  
  return (
    <ContentLayout title='Activity Log'>
    <div className="mb-6">
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
            <BreadcrumbPage>Activity Log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
    <div className="container mx-auto py-6">
      <ActivityLogHeader />
      
      <Card className="mb-6">
        <CardContent className="py-6">
          <ActivityLogFilters />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ActivityLogTable initialData={initialData} />
        </CardContent>
      </Card>
    </div>
    </div>
  </ContentLayout>  

  );
} 