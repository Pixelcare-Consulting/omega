"use client"

import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  dateAssigned: z.date({
    required_error: "Date assigned is required",
  }),
  bdr: z.string({
    required_error: "BDR is required",
  }).min(1, "BDR is required"),
  listType: z.string({
    required_error: "List type is required",
  }).min(1, "List type is required"),
  contactTierLevel: z.string({
    required_error: "Contact tier level is required",
  }).min(1, "Contact tier level is required"),
  percentageCompleted: z.number().min(0).max(100),
  totalLeadRecords: z.number().min(0),
  recordsEntered: z.number().min(0),
  recordsContacted: z.number().min(0),
  recordsQualified: z.number().min(0),
  recordsDisqualified: z.number().min(0),
  recordsCompleted: z.number().min(0),
  dateCreated: z.date(),
})

type FormValues = z.infer<typeof formSchema>

export function AddLeadListForm() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateAssigned: new Date(),
      bdr: "",
      listType: "",
      contactTierLevel: "",
      percentageCompleted: 0,
      totalLeadRecords: 0,
      recordsEntered: 0,
      recordsContacted: 0,
      recordsQualified: 0,
      recordsDisqualified: 0,
      recordsCompleted: 0,
      dateCreated: new Date(),
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      console.log(values)
      router.push('/dashboard/admin/crm/lead-lists')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              List Details
              <Badge variant="outline" className="font-normal">Required</Badge>
            </CardTitle>
            <CardDescription>Basic information about the lead list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dateAssigned"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Date Assigned*</FormLabel>
                    <FormDescription className="text-xs">When this list was assigned</FormDescription>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bdr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">BDR*</FormLabel>
                    <FormDescription className="text-xs">Business Development Representative</FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="Enter BDR email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">List Type*</FormLabel>
                    <FormDescription className="text-xs">Type of lead list</FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cold">
                          <div className="flex items-center gap-2">
                            <span>Cold</span>
                            <Badge variant="secondary" className="font-normal">New prospects</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="warm">
                          <div className="flex items-center gap-2">
                            <span>Warm</span>
                            <Badge variant="secondary" className="font-normal">Previous contact</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="hot">
                          <div className="flex items-center gap-2">
                            <span>Hot</span>
                            <Badge variant="secondary" className="font-normal">High potential</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactTierLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Contact Tier Level*</FormLabel>
                    <FormDescription className="text-xs">Priority level of contacts</FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tier1">
                          <div className="flex items-center gap-2">
                            <span>Tier 1</span>
                            <Badge variant="secondary" className="font-normal">High priority</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="tier2">
                          <div className="flex items-center gap-2">
                            <span>Tier 2</span>
                            <Badge variant="secondary" className="font-normal">Medium priority</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="tier3">
                          <div className="flex items-center gap-2">
                            <span>Tier 3</span>
                            <Badge variant="secondary" className="font-normal">Low priority</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              List Progress
              <Badge variant="outline" className="font-normal">Statistics</Badge>
            </CardTitle>
            <CardDescription>Track the progress of your lead list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="totalLeadRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records</FormLabel>
                    <FormDescription className="text-xs">Total number of leads in this list</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordsEntered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records - Entered</FormLabel>
                    <FormDescription className="text-xs">Number of leads added to the system</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordsContacted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records - Contacted</FormLabel>
                    <FormDescription className="text-xs">Number of leads that have been contacted</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordsQualified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records - Qualified</FormLabel>
                    <FormDescription className="text-xs">Number of leads that meet criteria</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordsDisqualified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records - Dis-Qualified</FormLabel>
                    <FormDescription className="text-xs">Number of leads that don't meet criteria</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recordsCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium"># of Lead records - Completed</FormLabel>
                    <FormDescription className="text-xs">Number of leads fully processed</FormDescription>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(+e.target.value)}
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Lead details
              <Badge variant="outline" className="font-normal">Coming soon</Badge>
            </CardTitle>
            <CardDescription>Detailed information about individual leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[100px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
              <p className="text-sm">Lead details will be available in the next update</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Audit Record details
              <Badge variant="outline" className="font-normal">System</Badge>
            </CardTitle>
            <CardDescription>System-generated audit information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[80px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg">
              <p className="text-sm">Audit records will be generated automatically</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard/admin/crm/lead-lists')}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="default"
            className="px-6"
          >
            Create List
          </Button>
        </div>
      </form>
    </Form>
  )
} 