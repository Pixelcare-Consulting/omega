"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ClipboardDocumentListIcon, 
  CalendarDaysIcon, 
  UsersIcon, 
  MegaphoneIcon, 
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/app/(protected)/_components/page-layout";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  status: string;
  leadType: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyPhone: string;
  website: string;
}

export function Leads() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("lead-details");
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [status, setStatus] = useState("entered");
  const [leadType, setLeadType] = useState("");
  const [reasonDisqualified, setReasonDisqualified] = useState("");
  const [salutation, setSalutation] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [revenueRange, setRevenueRange] = useState("");

  return (
    <PageLayout
      title="Lead Management"
      description="Manage and track your leads effectively"
      addButton={{
        label: "Add Lead",
        onClick: () => router.push('/dashboard/admin/crm/leads/add')
      }}
    >
      <Card>
        <CardContent>
          {/* Lead Info Card */}
          <div className="bg-white border rounded-xl p-8 mb-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Side */}
              <div className="col-span-4 space-y-4">
                <div>
                  <Label htmlFor="relatedLeadList">Related Lead List <span className="text-red-500">*</span></Label>
                  <Input id="relatedLeadList" />
                </div>
                <div>
                  <Label htmlFor="dateAcquired">Lead List - Date Acquired</Label>
                  <Input id="dateAcquired" type="date" />
                </div>
                <div>
                  <Label htmlFor="bdr">Lead List - BDR</Label>
                  <Input id="bdr" />
                </div>
                <div>
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="disqualified">Disqualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead Type</Label>
                  <Select value={leadType} onValueChange={setLeadType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Right Side */}
              <div className="col-span-8 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" className="h-20" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex items-end">
                    <div className="bg-white border rounded-md p-3 text-gray-500 text-sm flex items-center gap-2 w-full">
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                      No logged entries
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label>Reason Dis-Qualified</Label>
                    <Select value={reasonDisqualified} onValueChange={setReasonDisqualified}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-interested">Not interested</SelectItem>
                        <SelectItem value="no-budget">No budget</SelectItem>
                        <SelectItem value="wrong-contact">Wrong contact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="lead-details">
            <TabsList className="flex gap-6 border-b mb-4">
              <TabsTrigger value="lead-details" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Lead Details
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="calls" className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Calls
              </TabsTrigger>
              <TabsTrigger value="meetings" className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <MegaphoneIcon className="h-4 w-4" />
                Campaigns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lead-details">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <Label>Salutation</Label>
                  <Select value={salutation} onValueChange={setSalutation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salutation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr.</SelectItem>
                      <SelectItem value="mrs">Mrs.</SelectItem>
                      <SelectItem value="ms">Ms.</SelectItem>
                      <SelectItem value="dr">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" />
                </div>
                <div>
                  <Label htmlFor="suffix">Suffix</Label>
                  <Input id="suffix" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" />
                </div>
              </div>

              {/* Company Details Section */}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setShowCompanyDetails(!showCompanyDetails)}
                  className="flex items-center gap-2 mb-4"
                >
                  {showCompanyDetails ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                  Company Details
                </Button>

                {showCompanyDetails && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+81">+81</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="companyPhone" placeholder="(201) 555-0123" />
                        <Input className="w-24" placeholder="ext." />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" type="url" />
                    </div>
                    <div>
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input id="foundedYear" type="number" />
                    </div>
                    <div>
                      <Label>Revenue Range (USD)</Label>
                      <Select value={revenueRange} onValueChange={setRevenueRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1m">$0 - $1M</SelectItem>
                          <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                          <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                          <SelectItem value="50m+">$50M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Input id="employees" type="number" />
                    </div>
                    <div>
                      <Label htmlFor="locations">Number of Locations</Label>
                      <Input id="locations" type="number" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Textarea id="address" />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <div className="text-center py-8 text-muted-foreground">
                No activities recorded yet
              </div>
            </TabsContent>

            <TabsContent value="emails">
              <div className="text-center py-8 text-muted-foreground">
                No emails recorded yet
              </div>
            </TabsContent>

            <TabsContent value="calls">
              <div className="text-center py-8 text-muted-foreground">
                No calls recorded yet
              </div>
            </TabsContent>

            <TabsContent value="meetings">
              <div className="text-center py-8 text-muted-foreground">
                No meetings scheduled yet
              </div>
            </TabsContent>

            <TabsContent value="campaigns">
              <div className="text-center py-8 text-muted-foreground">
                No campaigns associated yet
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
} 