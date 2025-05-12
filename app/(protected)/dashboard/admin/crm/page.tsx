import { Metadata } from "next"
import { CrmClient } from "./_components/client"

export const metadata: Metadata = {
  title: "CRM Dashboard",
  description: "Manage your customer relationships effectively",
}

export default async function CRMDashboard() {
  return <CrmClient />
}
