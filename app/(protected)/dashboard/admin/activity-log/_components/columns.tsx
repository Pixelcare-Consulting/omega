'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export type ActivityLog = {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  eventType: 'user' | 'system' | 'security' | 'data';
  severity: 'info' | 'warning' | 'error' | 'critical';
  details: string;
  ipAddress?: string;
  userAgent?: string;
};

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export const columns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      return format(row.getValue('timestamp'), 'PPpp');
    },
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'eventType',
    header: 'Event Type',
    cell: ({ row }) => {
      const eventType = row.getValue('eventType') as string;
      return (
        <Badge variant="secondary">
          {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => {
      const severity = row.getValue('severity') as string;
      const variants: Record<string, BadgeVariant> = {
        info: 'default',
        warning: 'secondary',
        error: 'destructive',
        critical: 'destructive'
      };
      
      return (
        <Badge variant={variants[severity] || 'default'}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'details',
    header: 'Details',
  },
]; 