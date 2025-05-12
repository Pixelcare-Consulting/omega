"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { LeadLists } from "./lead-lists"
import { Leads } from "./leads"
import { CallLogs } from "./call-logs"
import { MeetingTracker } from "./meeting-tracker"

export function CrmClient() {
  const [activeTab, setActiveTab] = useState("lead-lists")

  return (
    <div className="h-full space-y-4">
      <Tabs defaultValue="lead-lists" className="h-full space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lead-lists">Lead Lists</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="call-logs">Call Logs</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="lead-lists" className="h-full">
          <Card className="h-full p-4">
            <LeadLists />
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="h-full">
          <Card className="h-full p-4">
            <Leads />
          </Card>
        </TabsContent>

        <TabsContent value="call-logs" className="h-full">
          <Card className="h-full p-4">
            <CallLogs />
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="h-full">
          <Card className="h-full p-4">
            <MeetingTracker />
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
} 