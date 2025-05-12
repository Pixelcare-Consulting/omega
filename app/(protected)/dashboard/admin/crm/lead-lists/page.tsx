import { Metadata } from "next"
import { LeadListsClient } from "../_components/lead-lists-client"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CRM | Lead Lists - OMEGA GTI",
  description: "Manage your lead lists effectively",
}

export default async function LeadListPage() {
  return (
    <ContentLayout title='Customer Relationship Management'>
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
              <Link href='/dashboard/admin/crm'>CSRM</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lead Lists</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] min-w-full justify-center">
        <LeadListsClient />
      </div>
    </ContentLayout>  
  )
}
