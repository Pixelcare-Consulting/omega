'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ActivityLogHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">Monitor and track system activities</p>
      </div>
      <Button variant="outline" className="gap-2" onClick={() => {
        // TODO: Implement export functionality
      }}>
        <Download className="h-4 w-4" />
        Export Logs
      </Button>
    </div>
  );
} 