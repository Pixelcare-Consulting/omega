'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { DayPicker } from 'react-day-picker';

interface ActivityLogFiltersProps {
  onFilterChange?: (filters: {
    search?: string;
    eventType?: string;
    severity?: string;
    date?: Date;
  }) => void;
}

export function ActivityLogFilters({ onFilterChange }: ActivityLogFiltersProps) {
  const [date, setDate] = useState<Date>();
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('all');
  const [severity, setSeverity] = useState('all');

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    onFilterChange?.({ search, eventType, severity, date });
  };

  return (
    <div className="space-y-4">
      <CardTitle>Filters</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or action..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onFilterChange?.({ search: e.target.value, eventType, severity, date });
            }}
          />
        </div>
        <div>
          <Select value={eventType} onValueChange={(value) => {
            setEventType(value);
            onFilterChange?.({ search, eventType: value, severity, date });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="user">User Events</SelectItem>
              <SelectItem value="system">System Events</SelectItem>
              <SelectItem value="security">Security Events</SelectItem>
              <SelectItem value="data">Data Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={severity} onValueChange={(value) => {
            setSeverity(value);
            onFilterChange?.({ search, eventType, severity: value, date });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className={cn(
              "rounded-md border bg-popover p-3",
              "absolute mt-2 hidden data-[state=open]:block"
            )}
          />
        </div>
      </div>
    </div>
  );
} 