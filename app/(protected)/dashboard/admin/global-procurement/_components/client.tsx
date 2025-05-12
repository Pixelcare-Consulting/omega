"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Customers } from "./customers"


export function GlobalProcurementClient() {

  return (
    <div className="h-full space-y-4">
      <Customers />
    </div>
  )
} 