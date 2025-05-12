'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EmbeddedGrafanaDashboard from './embedded-grafana-dashboard';

interface GrafanaDashboard {
  id: string;
  name: string;
  url: string;
}

export default function GrafanaDashboardGrid() {
  const [dashboards, setDashboards] = useState<GrafanaDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await fetch('/api/integrations/grafana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'getDashboards' }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.dashboards) {
          // Transform dashboards to include embed URLs
          const dashboardsWithUrls = data.dashboards.map((dashboard: any) => ({
            ...dashboard,
            url: `${data.grafanaUrl || process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3000'}/d/${dashboard.uid || dashboard.id}?orgId=1&kiosk&theme=light`
          }));
          setDashboards(dashboardsWithUrls);
        }
      } catch (error) {
        console.error('Error fetching dashboards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!dashboards.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>No Grafana dashboards available.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/admin/integrations">Set Up Grafana Integration</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {dashboards.map((dashboard) => (
        <Card key={dashboard.id} className="relative overflow-hidden">
          <CardHeader className="pb-0 flex justify-between items-start">
            <CardTitle className="text-lg">{dashboard.name}</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              asChild
              className="h-8 w-8"
            >
              <Link href={`/dashboard/grafana-view/${dashboard.id}`}>
                <Maximize2 className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <EmbeddedGrafanaDashboard 
              dashboardUrl={dashboard.url}
              height="300px"
              title=""
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 