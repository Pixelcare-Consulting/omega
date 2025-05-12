import { Metadata } from "next"
import { GlobalProcurementClient } from "./_components/client"

export const metadata: Metadata = {
  title: "Global Procurement Dashboard",
  description: "Manage your global procurement effectively",
}

export default async function GlobalProcurementDashboard() {
  return <GlobalProcurementClient />
} 