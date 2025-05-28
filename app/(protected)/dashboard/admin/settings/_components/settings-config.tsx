'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, Layout, PlusCircle, Users, Shield, Database, Sliders, Save, AlertCircle, CheckCircle, Globe, XCircle } from 'lucide-react';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

  const [sapStatus, setSapStatus] = useState<{
    status: 'unknown' | 'connected' | 'disconnected';
    expirationTime: number | null;
    tokenStatus?: string;
    tokenInfo?: {
      hasB1Session: boolean;
      hasRouteId: boolean;
      generatedAt?: number;
      b1sessionPreview?: string;
      routeidPreview?: string;
    } | null;
    credentials?: {
      baseUrl: string;
      companyDB: string;
      username: string;
    };
  }>({ status: 'unknown', expirationTime: null });

  const [isApiConfigDialogOpen, setIsApiConfigDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showCredentials, setShowCredentials] = useState(false); // State for showing credentials
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false); // State for password dialog
  const [credentialPassword, setCredentialPassword] = useState(''); // State for password input in dialog
  const [passwordError, setPasswordError] = useState(''); // State for password error message

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

    const loadSapSettings = async () => {
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/integrations/sap-b1/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch SAP settings');
        }

        const data = await response.json();

        if (data.success && data.settings) {
          setApiConfig(prev => ({
            ...prev,
            sapB1: data.settings
          }));
        }

        console.log('SAP settings loaded successfully');
      } catch (error) {
        console.error('Failed to load SAP settings:', error);
      }
    };

    loadSettings();
    loadSapSettings();
  }, []);

  // Fetch SAP status when the API config dialog is opened
  useEffect(() => {
    if (isApiConfigDialogOpen) {
      fetchSapStatus();
    }
  }, [isApiConfigDialogOpen]);

  // Countdown timer for token expiration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (sapStatus.status === 'connected' && sapStatus.expirationTime) {
      const calculateTimeRemaining = () => {
        const now = Date.now();
        const expiration = sapStatus.expirationTime!;
        const remaining = Math.max(0, expiration - now);
        setTimeRemaining(remaining);
      };

      calculateTimeRemaining(); // Calculate initial time
      timer = setInterval(calculateTimeRemaining, 1000); // Update every second
    } else {
      setTimeRemaining(null);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [sapStatus.status, sapStatus.expirationTime]);


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
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Successfully connected to SAP B1 Service Layer');
        // Refresh status after successful test
        fetchSapStatus();
      } else {
        // Show detailed error information
        const errorDetails = data.details?.troubleshooting
          ? `\n\nTroubleshooting: ${data.details.troubleshooting}`
          : '';

        toast.error(`Connection failed: ${data.error}${errorDetails}`);

        // Log detailed error for debugging
        console.error('SAP Connection Test Failed:', {
          error: data.error,
          details: data.details
        });
      }
    } catch (error) {
      console.error('Failed to test SAP connection:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to SAP B1');
    }
  };

  const refreshSAPToken = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('SAP token refreshed successfully');
        // Refresh status after successful token generation
        fetchSapStatus();
      } else {
        throw new Error(data.error || 'Failed to refresh SAP token');
      }
    } catch (error) {
      console.error('Failed to refresh SAP token:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refresh SAP token');
    }
  };

  const resetSAPToken = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('SAP token reset and regenerated successfully');
        // Refresh status after successful token reset
        fetchSapStatus();
      } else {
        throw new Error(data.error || 'Failed to reset SAP token');
      }
    } catch (error) {
      console.error('Failed to reset SAP token:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reset SAP token');
    }
  };

  const fetchSapStatus = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/integrations/sap-b1/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch SAP status');
      }
      const data = await response.json();
      setSapStatus(data);
    } catch (error) {
      console.error('Failed to fetch SAP status:', error);
      setSapStatus({ status: 'disconnected', expirationTime: null });
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

              {/* System Administration */}
              <div>
                <h3 className="text-lg font-medium">Developer Tools</h3>
                <Separator className="mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <Link href="/dashboard/admin/database">
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
                  </Link> */}

                  <Dialog open={isApiConfigDialogOpen} onOpenChange={setIsApiConfigDialogOpen}>
                    <DialogTrigger asChild>
                      <Card className="border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">SAP Service Layer</h3>
                            <p className="text-sm text-muted-foreground">Manage SAP Service Layer endpoints and external service connections</p>
                          </div>
                        </div>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>SAP Service Layer</DialogTitle>
                        <DialogDescription>
                          Information about SAP Service Layer endpoints and services.
                        </DialogDescription>
                        <Separator />
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <DialogTitle>SAP Business One Service Layer</DialogTitle>
                        <DialogDescription>
                         This is used for integration with SAP Business One Syncing Omega Portal.
                        </DialogDescription>
                        <Separator />
                        <Alert className="bg-yellow-100 border-yellow-400 text-yellow-800">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          <AlertTitle>Warning</AlertTitle>
                          <AlertDescription>
                            Please contact the developer if you require any changes to these configurations.
                          </AlertDescription>
                        </Alert>
                        <Separator />
                        <div className="space-y-4">
                          {!showCredentials ? (
                            <div className="flex justify-center">
                              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>Show Credentials</Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="serviceLayerUrl">Service Layer URL:</Label>
                                <Input
                                  id="serviceLayerUrl"
                                  value={apiConfig.sapB1.serviceLayerUrl}
                                  readOnly={!showCredentials}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="companyDB">Company DB:</Label>
                                <Input
                                  id="companyDB"
                                  value={apiConfig.sapB1.companyDB}
                                  readOnly={!showCredentials}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="username">Username:</Label>
                                <Input
                                  id="username"
                                  value={apiConfig.sapB1.username}
                                  readOnly={!showCredentials}
                                  className="mt-1"
                                />
                              </div>

                              {/* Token Information */}
                              {sapStatus.tokenInfo && (
                                <div className="space-y-2 p-3 bg-muted rounded-lg">
                                  <Label className="text-sm font-medium">Token Information:</Label>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">B1 Session:</span>
                                      <p className="font-mono">{sapStatus.tokenInfo.b1sessionPreview || 'Not available'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Route ID:</span>
                                      <p className="font-mono">{sapStatus.tokenInfo.routeidPreview || 'Not available'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Generated:</span>
                                      <p>{sapStatus.tokenInfo.generatedAt ?
                                        (() => {
                                          const date = new Date(sapStatus.tokenInfo.generatedAt);
                                          // Check if the date is valid
                                          if (isNaN(date.getTime())) {
                                            return 'Invalid Date';
                                          }
                                          // Check if the date is in a reasonable range (not in the future, not too old)
                                          const now = Date.now();
                                          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                                          if (date.getTime() > now || (now - date.getTime()) > maxAge) {
                                            return 'Invalid Date';
                                          }
                                          return date.toLocaleString();
                                        })()
                                        : 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Token Status:</span>
                                      <p className={`font-medium ${sapStatus.tokenStatus === 'valid' ? 'text-green-600' : sapStatus.tokenStatus === 'expired' ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {sapStatus.tokenStatus || 'Unknown'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <div>
                            <Label>Status:</Label>
                            <div className="flex items-center gap-2">
                              {sapStatus.status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {sapStatus.status === 'disconnected' && <XCircle className="h-5 w-5 text-red-500" />}
                              <p className={`text-sm ${sapStatus.status === 'connected' ? 'text-green-500' : sapStatus.status === 'disconnected' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {sapStatus.status === 'unknown' ? 'Loading...' : sapStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label>Token Expiration:</Label>
                            <p className="text-sm text-muted-foreground">
                              {timeRemaining !== null ?
                                timeRemaining > 0 ?
                                  `${Math.floor(timeRemaining / 60000)}m ${Math.floor((timeRemaining % 60000) / 1000)}s`
                                  : 'Expired'
                                : sapStatus.expirationTime ?
                                  (() => {
                                    const expDate = new Date(sapStatus.expirationTime);
                                    if (isNaN(expDate.getTime())) {
                                      return 'Invalid expiration time';
                                    }
                                    const now = Date.now();
                                    const remaining = sapStatus.expirationTime - now;
                                    if (remaining <= 0) {
                                      return 'Expired';
                                    }
                                    return `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s`;
                                  })()
                                  : sapStatus.status === 'disconnected' ? 'N/A' : 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={testSAPConnection}
                            disabled={!showCredentials}
                            className="gap-2"
                          >
                            <Database className="h-4 w-4" />
                            Test Connection
                          </Button>
                          <Button
                            variant="outline"
                            onClick={refreshSAPToken}
                            disabled={!showCredentials}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Refresh Token
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetSAPToken}
                            disabled={!showCredentials}
                            className="gap-2"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Reset Token
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {notification.type && (
                <Alert className={`mt-4 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                  <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
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

      {/* Password Verification Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter User Password</DialogTitle>
            <DialogDescription>
              Enter your user password to view sensitive credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credentialPassword" className="text-right">
                Password
              </Label>
              <Input
                id="credentialPassword"
                type="password"
                value={credentialPassword}
                onChange={(e) => setCredentialPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              // WARNING: This is an INSECURE frontend password check for demonstration purposes ONLY.
              // Storing sensitive passwords or their verification logic on the frontend is a major security vulnerability.
              // In a production application, password verification MUST be done securely on the backend.

              setPasswordError(''); // Clear previous errors

              // Basic frontend check (INSECURE):
              const insecureHardcodedPassword = 'admin123';
              if (credentialPassword === insecureHardcodedPassword) {
                setShowCredentials(true);
                setIsPasswordDialogOpen(false);
                setCredentialPassword(''); // Clear password input
              } else {
                setPasswordError('Unauthorized User!');
              }
            }}>
              Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
