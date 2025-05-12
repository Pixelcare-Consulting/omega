import { Metadata } from "next"
import { CustomerForm } from "../../_components/customer-form"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ContentLayout } from '@/app/(protected)/_components/content-layout'
import Link from "next/link"

export const metadata: Metadata = {
  title: "Add Customer - Global Procurement | OMEGA GTI",
  description: "Add a new customer to the system",
}

export default async function AddCustomerPage() {
  return (
    <ContentLayout title='Add Customer'>
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
              <BreadcrumbLink asChild>
                <Link href='/dashboard/admin/global-procurement'>Global Procurement</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/dashboard/admin/global-procurement/customers'>Customers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Customer</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]">
        <CustomerForm />
      </div>
    </ContentLayout>
  )
}
