import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { ContentLayout } from "../../_components/content-layout"
import { ProfileForm } from "./_components/profile-form"
import { SecuritySettings } from "./_components/security-settings"
import Link from "next/link"
import { ChevronRight, Home, User, Bell, Shield, Laptop } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <ContentLayout title="My Profile">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Profile Settings
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-red-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-red-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-red-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="data-[state=active]:bg-background relative h-12 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-b-red-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <Laptop className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="p-6">
              <ProfileForm />
            </TabsContent>
            <TabsContent value="security" className="p-6">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="notifications" className="p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Notification settings coming soon...
              </div>
            </TabsContent>
            <TabsContent value="preferences" className="p-6">
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Preferences settings coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ContentLayout>
  )
} 