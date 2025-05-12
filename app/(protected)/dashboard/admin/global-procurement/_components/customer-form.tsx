"use client";

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/ui/phone-input"

interface CustomerFormData {
  companyName: string
  vendorCode: string
  accountType: string
  type: string
  status: string
  creditHold: boolean
  industryType: string
  mainAddress: string
  region: string
  mainPhone: string
  warehouseCustomer: boolean
  salesEmployee: string
  bdrSalesRep: string
  accountExecutive: string
  accountAssociate: string
  excessManager: string[]
  statusUpdates: string
}

export function CustomerForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("contacts")
  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: "",
    vendorCode: "",
    accountType: "",
    type: "",
    status: "Tier 3 (Prospect)",
    creditHold: false,
    industryType: "",
    mainAddress: "",
    region: "",
    mainPhone: "",
    warehouseCustomer: false,
    salesEmployee: "",
    bdrSalesRep: "",
    accountExecutive: "",
    accountAssociate: "",
    excessManager: [],
    statusUpdates: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <PageLayout
      title="Add Customer"
      description="Create a new customer record"
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vendorCode">Vendor Code</Label>
                  <Input
                    id="vendorCode"
                    value={formData.vendorCode}
                    onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type (House/Owned)</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oem">OEM</SelectItem>
                      <SelectItem value="cm">CM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tier 3 (Prospect)">Tier 3 (Prospect)</SelectItem>
                      <SelectItem value="Tier 2">Tier 2</SelectItem>
                      <SelectItem value="Tier 1">Tier 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="creditHold"
                    checked={formData.creditHold}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, creditHold: checked as boolean })
                    }
                  />
                  <Label htmlFor="creditHold">CREDIT HOLD</Label>
                </div>
                <div>
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Input
                    id="industryType"
                    value={formData.industryType}
                    onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                  />
                </div>
              </div>

              {/* Address & Contact */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mainAddress">Main Address</Label>
                  <Textarea
                    id="mainAddress"
                    value={formData.mainAddress}
                    onChange={(e) => setFormData({ ...formData, mainAddress: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="na">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="mainPhone">Main Phone</Label>
                  <PhoneInput
                    value={formData.mainPhone}
                    onChange={(value) => setFormData({ ...formData, mainPhone: value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="warehouseCustomer"
                    checked={formData.warehouseCustomer}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, warehouseCustomer: checked as boolean })
                    }
                  />
                  <Label htmlFor="warehouseCustomer">Warehousing Customer</Label>
                </div>
              </div>

              {/* Employee Assignment */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salesEmployee">Sales Employee</Label>
                  <Select
                    value={formData.salesEmployee}
                    onValueChange={(value) => setFormData({ ...formData, salesEmployee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee1">Employee 1</SelectItem>
                      <SelectItem value="employee2">Employee 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bdrSalesRep">BDR / Inside Sales Rep</Label>
                  <Select
                    value={formData.bdrSalesRep}
                    onValueChange={(value) => setFormData({ ...formData, bdrSalesRep: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rep1">Sales Rep 1</SelectItem>
                      <SelectItem value="rep2">Sales Rep 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountExecutive">Account Executive</Label>
                  <Select
                    value={formData.accountExecutive}
                    onValueChange={(value) => setFormData({ ...formData, accountExecutive: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exec1">Executive 1</SelectItem>
                      <SelectItem value="exec2">Executive 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountAssociate">Account Associate</Label>
                  <Select
                    value={formData.accountAssociate}
                    onValueChange={(value) => setFormData({ ...formData, accountAssociate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assoc1">Associate 1</SelectItem>
                      <SelectItem value="assoc2">Associate 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="excessManager">Excess Manager</Label>
                  <Select
                    value={formData.excessManager[0]}
                    onValueChange={(value) => setFormData({ ...formData, excessManager: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select one or more" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager1">Manager 1</SelectItem>
                      <SelectItem value="manager2">Manager 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Updates */}
              <div className="col-span-2">
                <Label htmlFor="statusUpdates">Status Updates</Label>
                <Textarea
                  id="statusUpdates"
                  value={formData.statusUpdates}
                  onChange={(e) => setFormData({ ...formData, statusUpdates: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Tabs Section */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-9 w-full">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
              <TabsTrigger value="excessLists">Excess Lists</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="entertainment">Entertainment Summary</TabsTrigger>
              <TabsTrigger value="expenses">Employee Expenses</TabsTrigger>
              <TabsTrigger value="assignments">Customer Assignments</TabsTrigger>
              <TabsTrigger value="developer">Developer Only</TabsTrigger>
            </TabsList>
            <TabsContent value="contacts">
              <div className="text-center py-8 text-muted-foreground">
                No contacts added yet
              </div>
            </TabsContent>
            {/* Add other TabsContent components for remaining tabs */}
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  )
} 