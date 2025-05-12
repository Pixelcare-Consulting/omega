'use client'

import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
  View,
  NavigatingEventArgs,
} from "@syncfusion/ej2-react-schedule";
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { registerLicense } from '@syncfusion/ej2-base'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXtfd3RRQ2VcVEZ/XURWYUA=')

const CalendarClient = () => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const categories = [
    { name: 'Meeting', color: '#3b82f6' },
    { name: 'Training', color: '#22c55e' },
    { name: 'Conference', color: '#a855f7' },
    { name: 'Holiday', color: '#ef4444' },
    { name: 'Personal', color: '#eab308' },
  ]

  const localData = [
    {
      Id: 1,
      Subject: 'Team Planning Meeting',
      StartTime: new Date(2024, 0, 15, 10, 0),
      EndTime: new Date(2024, 0, 15, 12, 30),
      IsAllDay: false,
      Status: 'Completed',
      Priority: 'High',
      CategoryColor: '#3b82f6',
      Category: 'Meeting'
    },
    {
      Id: 2,
      Subject: 'Product Training',
      StartTime: new Date(2024, 0, 16, 14, 0),
      EndTime: new Date(2024, 0, 16, 16, 0),
      IsAllDay: false,
      Status: 'Pending',
      Priority: 'Normal',
      CategoryColor: '#22c55e',
      Category: 'Training'
    },
    {
      Id: 3,
      Subject: 'Annual Conference',
      StartTime: new Date(2024, 0, 18, 9, 0),
      EndTime: new Date(2024, 0, 20, 18, 0),
      IsAllDay: true,
      Status: 'Pending',
      Priority: 'High',
      CategoryColor: '#a855f7',
      Category: 'Conference'
    }
  ]

  // Different calendar views configuration
  const views: { option: View, allowVirtualScrolling: boolean }[] = [
    { option: 'Day', allowVirtualScrolling: false },
    { option: 'Week', allowVirtualScrolling: false },
    { option: 'WorkWeek', allowVirtualScrolling: false },
    { option: 'Month', allowVirtualScrolling: false },
    { option: 'Agenda', allowVirtualScrolling: false }
  ]

  const onNavigating = (args: NavigatingEventArgs) => {
    if (args.currentDate) {
      setDate(args.currentDate)
    }
  }

  // Get upcoming events (next 5 events from today)
  const upcomingEvents = localData
    .filter(event => event.StartTime >= new Date())
    .sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime())
    .slice(0, 5);

  // Format date for display
  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-6 w-[300px]">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Star className="mr-2 h-4 w-4" />
              View Favorites
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Recent Events
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.Id} className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.CategoryColor }} />
                      <span className="font-medium">{event.Subject}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground ml-4">
                      <Clock className="mr-2 h-3 w-3" />
                      {formatEventDate(event.StartTime)}
                    </div>
                    <Badge variant="secondary" className="w-fit ml-4">
                      {event.Category}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar */}
      <div className="flex-1">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <CalendarDays className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name.toLowerCase()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Component */}
        <Card>
          <CardContent className="p-6">
            <ScheduleComponent
              height="700px"
              width="100%"
              selectedDate={date}
              currentView="Month"
              eventSettings={{ 
                dataSource: localData,
                fields: {
                  subject: { name: 'Subject' },
                  startTime: { name: 'StartTime' },
                  endTime: { name: 'EndTime' },
                  isAllDay: { name: 'IsAllDay' }
                }
              }}
              navigating={onNavigating}
              className="rounded-md border"
              cssClass={theme === 'dark' ? 'e-schedule-dark-mode' : 'e-schedule-light-mode'}
            >
              <ViewsDirective>
                {views.map((item) => (
                  <ViewDirective
                    key={item.option}
                    option={item.option}
                    allowVirtualScrolling={item.allowVirtualScrolling}
                  />
                ))}
              </ViewsDirective>
              <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
            </ScheduleComponent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CalendarClient 