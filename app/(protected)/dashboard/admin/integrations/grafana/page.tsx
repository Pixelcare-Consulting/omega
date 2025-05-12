'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GrafanaIntegration from '@/app/(protected)/dashboard/custom-builder/_components/grafana-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define types to match the GrafanaIntegration component
interface DashboardData {
  id: string;
  name?: string;
  title?: string;
  fields: any[];
  tables: any[];
  charts: any[];
  dataSource: string;
  url?: string;
}

export default function GrafanaIntegrationPage() {
  const [importedDashboard, setImportedDashboard] = useState<DashboardData | null>(null);

  const handleDashboardImport = (dashboardData: DashboardData) => {
    setImportedDashboard(dashboardData);
    // In a real application, you would save this data to your database
    console.log('Dashboard imported:', dashboardData);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/admin/integrations" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Grafana Integration</h1>
          <p className="text-muted-foreground">Connect Grafana for powerful analytics dashboards</p>
        </div>
      </div>

      {importedDashboard && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Imported Dashboard</CardTitle>
            <CardDescription>Successfully imported a dashboard from Grafana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="font-medium text-green-800">{importedDashboard.name || importedDashboard.title}</h3>
              <p className="text-sm text-green-700 mt-1">
                Imported {importedDashboard.charts.length} charts, {importedDashboard.tables.length} tables,
                and {importedDashboard.fields.length} fields from source: {importedDashboard.dataSource}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <GrafanaIntegration onImport={handleDashboardImport} />
    </div>
  );
} 