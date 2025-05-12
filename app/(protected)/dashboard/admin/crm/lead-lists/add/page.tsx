import { Metadata } from "next"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'
import { PageLayout } from '@/app/(protected)/_components/page-layout'
import Link from "next/link"
import { AddLeadListForm } from "../_components/add-lead-list-form"

export const metadata: Metadata = {
  title: "Add Lead List - OMEGA GTI",
  description: "Create a new lead list and manage its details",
}

export default function AddLeadListPage() {
  return (
    <ContentLayout title='Customer Relationship Management'>
      <div>
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
                <Link href='/dashboard/admin/crm'>CRM</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/dashboard/admin/crm/lead-lists'>Lead Lists</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add New List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageLayout
          title="Add Lead List"
          description="Create a new lead list and manage its details"
        >
          <AddLeadListForm />
        </PageLayout>
      </div>
    </ContentLayout>
  )
} 