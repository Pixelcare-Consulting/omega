import { Metadata } from "next"
import { Leads } from "../_components/leads"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'
import Link from "next/link"

export const metadata: Metadata = {
  title: "CSRM | Leads - OMEGA GTI",
  description: "Manage your leads effectively",
}

export default async function LeadsPage() {
  return (
    <ContentLayout title='Leads'>
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
            <BreadcrumbPage>Leads</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
      <Leads />
    </div>
  </ContentLayout>  
  )
} 