'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, Layout, PlusCircle, Users, Shield, Database, Sliders, Save, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateMetadata } from '@/app/lib/metadata';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Types
interface SystemSettings {
  debugMode: boolean;
  activityLogs: boolean;
  systemName: string;
  defaultLocale: string;
  defaultTheme: string;
  grafanaUrl?: string;
  grafanaApiKey?: string;
  enableGrafanaEmbedding?: boolean;
}

interface DashboardSettings {
  enableCustomDashboards: boolean;
  maxDashboardsPerUser: number;
  defaultLayout: string;
  showWelcomeBanner: boolean;
}

interface ApiConfig {
  enablePublicApi: boolean;
  apiKey: string;
  allowedOrigins: string;
  rateLimitPerMin: number;
  sapB1: {
    serviceLayerUrl: string;
    companyDB: string;
    username: string;
    password: string;
    language: string;
    useTLS: boolean;
  };
}

// Helper function to get base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export default function SettingsConfig() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    activityLogs: true,
    debugMode: false,
    systemName: 'Omega',
    defaultLocale: 'en-US',
    defaultTheme: 'system',
    grafanaUrl: '',
    grafanaApiKey: '',
    enableGrafanaEmbedding: false
  });

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    enableCustomDashboards: true,
    maxDashboardsPerUser: 5,
    defaultLayout: 'standard',
    showWelcomeBanner: true
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    enablePublicApi: false,
    apiKey: '',
    allowedOrigins: '*',
    rateLimitPerMin: 100,
    sapB1: {
      serviceLayerUrl: '',
      companyDB: '',
      username: '',
      password: '',
      language: 'en-US',
      useTLS: true
    }
  });

  // Load settings from the database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        if (data.systemSettings) {
          setSystemSettings(data.systemSettings);
        }
        
        if (data.dashboardSettings) {
          setDashboardSettings(data.dashboardSettings);
        }
        
        console.log('Settings loaded successfully');
      } catch (error) {
        console.error('Failed to load settings:', error);
        showNotification('error', 'Could not load settings from the database.');
      }
    };

    loadSettings();
  }, []);

  // Update theme when defaultTheme changes
  useEffect(() => {
    if (systemSettings.defaultTheme) {
      setTheme(systemSettings.defaultTheme);
    }
  }, [systemSettings.defaultTheme, setTheme]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: null, message: '' });
    }, 5000);
  };

  const handleSystemChange = async (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'defaultTheme') {
      setTheme(value);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemSettings,
          dashboardSettings
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Update metadata only after successful save
      if (systemSettings.systemName) {
        await updateMetadata(systemSettings.systemName);
      }
      
      toast.success('Settings saved successfully');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Could not save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardChange = (key: keyof DashboardSettings, value: any) => {
    setDashboardSettings(prev => ({ ...prev, [key]: value }));
  };

  const testSAPConnection = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: apiConfig.sapB1.serviceLayerUrl,
          companyDB: apiConfig.sapB1.companyDB,
          username: apiConfig.sapB1.username,
          password: apiConfig.sapB1.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully connected to SAP B1 Service Layer');
      } else {
        throw new Error(data.error || 'Failed to connect to SAP B1');
      }
    } catch (error) {
      console.error('Failed to test SAP connection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to SAP B1');
    }
  };

  return (
    <div className="container mx-auto py-6">
      {notification.type && (
        <div className={`mb-4 p-4 rounded-md flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p>{notification.message}</p>
          <button 
            className="ml-auto text-sm"
            onClick={() => setNotification({ type: null, message: '' })}
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Manage global system settings and configurations</p>
        </div>
        <Button onClick={saveSettings} disabled={loading} className="gap-2">
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Management</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* System Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage global system configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Configuration</h3>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="systemName">System Name</Label>
                      <Input 
                        id="systemName" 
                        value={systemSettings.systemName} 
                        onChange={(e) => handleSystemChange('systemName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="defaultLocale">Default Locale</Label>
                      <Select 
                        value={systemSettings.defaultLocale}
                        onValueChange={(value) => handleSystemChange('defaultLocale', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select locale" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="defaultTheme">Default Theme</Label>
                      <Select
                        value={systemSettings.defaultTheme}
                        onValueChange={(value) => handleSystemChange('defaultTheme', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                      <div>
                        <Label htmlFor="activityLogs">Activity Logs</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable activity logs
                        </p>
                      </div>
                      <Switch
                        id="activityLogs"
                        checked={systemSettings.activityLogs}
                        onCheckedChange={(checked) => handleSystemChange('activityLogs', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                      <div>
                        <Label htmlFor="debugMode">Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable detailed error messages and logging
                        </p>
                      </div>
                      <Switch
                        id="debugMode"
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => handleSystemChange('debugMode', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* System Administration  DO NOT UNCOMMENT THIS SECTION HIDING THIS TEMPORARILY
              <div>
                <h3 className="text-lg font-medium">System Administration</h3>
                <Separator className="mb-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/database">
                    <Card className="border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Database className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Database Configuration</h3>
                          <p className="text-sm text-muted-foreground">Configure database connections, roles and structure</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">API Configuration</h3>
                            <p className="text-sm text-muted-foreground">Manage API endpoints and external service connections</p>
                          </div>
                        </div>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              {/* <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button> */}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Dashboard Management Tab */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Management</CardTitle>
              <CardDescription>Configure and customize dashboard experiences for all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dashboard Settings Content */}
              {/* ... (Dashboard management content) ... */}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Users & Permissions Tab */}
        <TabsContent value="users">
          <Card className="border-none mt-2 mb-2">
            <CardHeader>
              <CardTitle>Users & Permissions</CardTitle>
              <CardDescription>Manage user access and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/admin/users">
                <Card className="border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">User Management</h3>
                        <p className="text-sm text-muted-foreground">Manage system users</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
              
              <Link href="/dashboard/admin/roles">
                <Card className="border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Roles & Permissions</h3>
                        <p className="text-sm text-muted-foreground">Configure user roles and access rights</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced system settings</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 