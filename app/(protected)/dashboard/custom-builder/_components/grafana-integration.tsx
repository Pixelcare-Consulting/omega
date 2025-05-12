'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Check, ChevronRight, Database, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

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

interface GrafanaIntegrationProps {
  dashboardConfig?: any;
  onImport?: (dashboardData: DashboardData) => void;
  onImportFromGrafana?: (dashboardData: DashboardData) => void;
}

// Local storage keys
const GRAFANA_URL_KEY = 'grafana_url';
const GRAFANA_API_KEY = 'grafana_api_key';
const GRAFANA_CONNECTED = 'grafana_connected';

export default function GrafanaIntegration({ dashboardConfig, onImport, onImportFromGrafana }: GrafanaIntegrationProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDashboards, setAvailableDashboards] = useState<DashboardData[]>([]);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to get from localStorage first
        const savedUrl = localStorage.getItem(GRAFANA_URL_KEY);
        const savedApiKey = localStorage.getItem(GRAFANA_API_KEY);
        const savedConnected = localStorage.getItem(GRAFANA_CONNECTED) === 'true';
        
        if (savedUrl && savedApiKey) {
          setUrl(savedUrl);
          setApiKey(savedApiKey);
          
          if (savedConnected) {
            setIsConnected(true);
            // Fetch available dashboards if we're connected
            await fetchAvailableDashboards(savedUrl, savedApiKey);
          }
        } else {
          // If not in localStorage, try to fetch from settings API
          const response = await fetch('/api/settings');
          const data = await response.json();
          
          if (data.systemSettings?.grafanaUrl && data.systemSettings?.grafanaApiKey) {
            setUrl(data.systemSettings.grafanaUrl);
            setApiKey(data.systemSettings.grafanaApiKey);
            
            // If we have valid credentials, consider connected
            setIsConnected(true);
            // Fetch available dashboards
            await fetchAvailableDashboards(
              data.systemSettings.grafanaUrl, 
              data.systemSettings.grafanaApiKey
            );
            
            // Also save to localStorage for persistence
            localStorage.setItem(GRAFANA_URL_KEY, data.systemSettings.grafanaUrl);
            localStorage.setItem(GRAFANA_API_KEY, data.systemSettings.grafanaApiKey);
            localStorage.setItem(GRAFANA_CONNECTED, 'true');
          }
        }
      } catch (error) {
        console.error('Failed to load Grafana settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save config to both localStorage and API
  const saveConfig = async (url: string, apiKey: string, isConnected: boolean) => {
    // Save to localStorage
    localStorage.setItem(GRAFANA_URL_KEY, url);
    localStorage.setItem(GRAFANA_API_KEY, apiKey);
    localStorage.setItem(GRAFANA_CONNECTED, isConnected ? 'true' : 'false');
    
    // Save to settings API
    try {
      const response = await fetch('/api/integrations/grafana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'saveConfig',
          url,
          apiKey,
          enableEmbedding: true
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        console.warn('Failed to save Grafana config to API:', data.message);
      }
    } catch (error) {
      console.error('Error saving Grafana config to API:', error);
    }
  };

  async function testConnection() {
    if (!url || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please provide both Grafana URL and API Key",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const response = await fetch('/api/integrations/grafana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'testConnection',
          url,
          apiKey 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Connection successful",
          description: `Connected to Grafana version ${data.version}`,
          variant: "default",
        });
        setIsConnected(true);
        // Save the credentials
        await saveConfig(url, apiKey, true);
        // Fetch available dashboards
        await fetchAvailableDashboards(url, apiKey);
      } else {
        toast({
          title: "Connection failed",
          description: data.error || "Could not connect to Grafana server",
          variant: "destructive",
        });
        setIsConnected(false);
        // Clear connection status in localStorage
        localStorage.setItem(GRAFANA_CONNECTED, 'false');
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsConnected(false);
      // Clear connection status in localStorage
      localStorage.setItem(GRAFANA_CONNECTED, 'false');
    } finally {
      setIsConnecting(false);
    }
  }

  async function fetchAvailableDashboards(urlParam = url, apiKeyParam = apiKey) {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/integrations/grafana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'importDashboards',
          url: urlParam,
          apiKey: apiKeyParam 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.dashboards) {
        setAvailableDashboards(data.dashboards);
      } else {
        toast({
          title: "Failed to fetch dashboards",
          description: data.error || "Could not retrieve Grafana dashboards",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching dashboards",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleDisconnect() {
    setIsConnected(false);
    setAvailableDashboards([]);
    // Clear connection status in localStorage
    localStorage.setItem(GRAFANA_CONNECTED, 'false');
  }

  function handleImportDashboard(dashboard: DashboardData) {
    const importCallback = onImportFromGrafana || onImport;
    if (importCallback) {
      importCallback(dashboard);
    }
    
    toast({
      title: "Dashboard imported",
      description: `Successfully imported "${dashboard.name || dashboard.title}" from Grafana`,
      variant: "default",
    });
  }

  function handleViewDashboard(dashboard: DashboardData) {
    // Open dashboard in a new tab
    window.open(`/dashboard/grafana-view/${dashboard.id}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Grafana Connection
          </CardTitle>
          <CardDescription>
            Connect to your Grafana instance to import dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grafana-url">Grafana URL</Label>
            <Input
              id="grafana-url"
              placeholder="https://grafana.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isConnected}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Grafana API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isConnected}
            />
            <p className="text-sm text-gray-500">
              Generate an API key in your Grafana instance with Admin or Editor privileges
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isConnected ? (
            <div className="flex items-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnect}
                className="ml-2"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={testConnection} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Available Dashboards</CardTitle>
            <CardDescription>
              Select a dashboard to import its configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : availableDashboards.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No dashboards available from this Grafana instance</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => fetchAvailableDashboards()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {availableDashboards.map((dashboard) => (
                  <div 
                    key={dashboard.id}
                    className="p-4 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{dashboard.name || dashboard.title}</h3>
                        <p className="text-sm text-gray-500">
                          {dashboard.fields.length} fields, {dashboard.tables.length} tables, {dashboard.charts.length} charts
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Data source: {dashboard.dataSource}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDashboard(dashboard)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleImportDashboard(dashboard)}
                        >
                          Import
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">About Grafana Integration</h3>
        <p className="text-gray-600">
          This integration allows you to import dashboards from your Grafana instance into our custom dashboard builder.
          You can select metrics, visualizations, and tables that are already defined in your Grafana dashboards.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Benefits</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Import existing dashboard configurations</li>
                <li>Reuse metrics and visualizations you've already built</li>
                <li>Maintain consistency across platforms</li>
                <li>Save time by avoiding duplicate configuration</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Grafana v8.0 or higher</li>
                <li>API key with Admin or Editor access</li>
                <li>Network access to your Grafana instance</li>
                <li>Dashboards that use supported data sources</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 