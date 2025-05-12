'use client';

import React, { useState, useEffect } from 'react';
import { CustomDashboardExample } from '../_components/custom-dashboard-example';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PlusCircle, Sliders, LayoutDashboard, Link2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomFieldForm } from './_components/custom-field-form';
import { CustomTableForm } from './_components/custom-table-form';
import GrafanaIntegration from './_components/grafana-integration';
import EmbeddedGrafanaDashboard from '../_components/embedded-grafana-dashboard';
import { Loader2 } from 'lucide-react';

// Define interfaces for the dashboard components
interface FieldType {
  id?: string;
  label: string;
  description: string;
  type: string;
  defaultValue?: string | number;
}

interface ColumnType {
  id?: string;
  label: string;
  type: string;
}

interface TableType {
  id?: string;
  name: string;
  description?: string;
  columns: ColumnType[];
}

interface DashboardConfig {
  name: string;
  fields: FieldType[];
  tables: TableType[];
  charts: any[];
  dataSource: string;
}

interface GrafanaDashboard {
  id: string;
  uid?: string;
  name?: string;
  title?: string;
  url?: string;
  fields: any[];
  tables: any[];
  charts: any[];
  dataSource: string;
}

export default function CustomDashboardBuilderPage() {
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    name: 'My Custom Dashboard',
    fields: [],
    tables: [],
    charts: [],
    dataSource: 'default'
  });
  
  const [grafanaDashboards, setGrafanaDashboards] = useState<GrafanaDashboard[]>([]);
  const [isLoadingGrafana, setIsLoadingGrafana] = useState(true);
  const [activeTab, setActiveTab] = useState('example');

  // Fetch Grafana dashboards when the component mounts
  useEffect(() => {
    const fetchGrafanaDashboards = async () => {
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
          setGrafanaDashboards(dashboardsWithUrls);
        }
      } catch (error) {
        console.error('Error fetching dashboards:', error);
      } finally {
        setIsLoadingGrafana(false);
      }
    };

    fetchGrafanaDashboards();
  }, []);

  const handleAddField = (field: any) => {
    // Convert the field from the form to our FieldType
    const newField: FieldType = {
      label: field.label,
      description: field.description || '',
      type: field.type || 'string',
      defaultValue: field.defaultValue
    };
    
    setDashboardConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    console.log('New field added:', field);
  };

  const handleAddTable = (table: any) => {
    // Convert the table from the form to our TableType
    const newTable: TableType = {
      name: table.tableName || 'New Table',
      description: table.description || '',
      columns: table.columns || [] // Ensure columns is always an array
    };
    
    setDashboardConfig(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }));
    console.log('New table added:', table);
  };

  const handleImportFromGrafana = (importedConfig: GrafanaDashboard) => {
    // Update the dashboard config with the imported data
    setDashboardConfig({
      ...dashboardConfig,
      name: importedConfig.name || importedConfig.title || dashboardConfig.name,
      fields: importedConfig.fields || [],
      tables: (importedConfig.tables || []).map(table => ({
        ...table,
        columns: table.columns || [] // Ensure columns is always an array
      })),
      charts: importedConfig.charts || [],
      dataSource: importedConfig.dataSource || dashboardConfig.dataSource
    });
    console.log('Imported configuration from Grafana:', importedConfig);
    
    // Change to builder tab
    setActiveTab('builder');
  };
  
  const navigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="flex flex-col mx-auto space-y-4 container py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Dashboard Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage your custom dashboards</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="example" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Example
            </TabsTrigger>
            {/* <TabsTrigger value="builder" className="gap-2">
              <Sliders className="h-4 w-4" />
              Builder
            </TabsTrigger> */}
            <TabsTrigger value="grafana" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboards Builder
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="example">
          <Card>
            <CardContent className="p-6">
              <CustomDashboardExample />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Builder</CardTitle>
              <CardDescription>
                Use the tools below to create your custom dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomFieldForm 
                  onAddField={handleAddField}
                  trigger={
                    <Card className="p-4 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center h-40">
                        <div className="rounded-full bg-primary/10 p-3 mb-3">
                          <PlusCircle className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Add Field</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a custom metric or KPI
                        </p>
                      </div>
                    </Card>
                  }
                />

                <CustomTableForm
                  onAddTable={handleAddTable}
                  trigger={
                    <Card className="p-4 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center h-40">
                        <div className="rounded-full bg-primary/10 p-3 mb-3">
                          <PlusCircle className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium">Add Table</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create a custom data table
                        </p>
                      </div>
                    </Card>
                  }
                />

                <Card className="p-4 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center h-40">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Add Chart</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a custom data visualization
                    </p>
                  </div>
                </Card>
              </div>

              <div className="mt-8 border border-dashed rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                {dashboardConfig.fields.length > 0 || dashboardConfig.tables.length > 0 ? (
                  <div className="w-full">
                    <h3 className="text-lg font-medium mb-4">Dashboard Preview: {dashboardConfig.name}</h3>
                    
                    {dashboardConfig.fields.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Fields</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {dashboardConfig.fields.map((field, index) => (
                            <Card key={index} className="p-4">
                              <h5 className="text-sm font-medium">{field.label}</h5>
                              <p className="text-2xl font-bold mt-2">{field.defaultValue || '0'}</p>
                              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {dashboardConfig.tables.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tables</h4>
                        {dashboardConfig.tables.map((table, index) => (
                          <Card key={index} className="p-4 mb-4">
                            <h5 className="text-sm font-medium mb-2">{table.name}</h5>
                            <div className="border rounded-md overflow-hidden">
                              <div className="grid grid-cols-3 bg-muted p-2 text-xs font-medium">
                                {(table.columns || []).slice(0, 3).map((col, colIndex) => (
                                  <div key={colIndex}>{col.label}</div>
                                ))}
                              </div>
                              <div className="p-2 text-sm text-muted-foreground">
                                Sample data will appear here
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your Dashboard Preview</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Start adding components from above to build your custom dashboard. 
                      Components will appear here as you add them.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grafana">
          <Card>
            <CardHeader>
              <CardTitle>Custom Dashboards</CardTitle>
              <CardDescription>
                View and manage dashboards from your Grafana integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGrafana ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : grafanaDashboards.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No Custom dashboards available.</p>
                  <Button onClick={() => navigateToTab('integrations')}>
                    Set Up Dashboard Integration
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grafanaDashboards.map((dashboard) => (
                    <Card key={dashboard.id} className="relative overflow-hidden">
                      <CardHeader className="pb-0 flex justify-between items-start">
                        <CardTitle className="text-lg">{dashboard.title || dashboard.name}</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Import the dashboard configuration
                            handleImportFromGrafana(dashboard);
                          }}
                        >
                          Use in Builder
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0 pt-2">
                        <EmbeddedGrafanaDashboard 
                          dashboardUrl={dashboard.url || ''}
                          height="300px"
                          title=""
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Integrations</CardTitle>
                  <CardDescription>
                    Connect your custom dashboard with external analytics platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <GrafanaIntegration 
                      dashboardConfig={dashboardConfig}
                      onImportFromGrafana={handleImportFromGrafana}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Integration Benefits</CardTitle>
                  <CardDescription>
                    Why connect with external platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <h3 className="text-sm font-medium mb-1">Advanced Analytics</h3>
                      <p className="text-xs text-muted-foreground">
                        Access powerful visualization tools and detailed metrics available in specialized platforms
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="text-sm font-medium mb-1">Data Synchronization</h3>
                      <p className="text-xs text-muted-foreground">
                        Keep your dashboards in sync across multiple platforms automatically
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <h3 className="text-sm font-medium mb-1">Extended Capabilities</h3>
                      <p className="text-xs text-muted-foreground">
                        Leverage alerts, notifications, and advanced data processing features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How To Use Custom Dashboard Builder</CardTitle>
          <CardDescription>
            Follow these steps to create your own personalized dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border bg-card">
                <div className="rounded-full bg-primary/10 p-3 mb-3 w-fit">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium mb-2">Add Components</h3>
                <p className="text-sm text-muted-foreground">
                  Select components from the builder tab to add fields, tables, or charts to your dashboard.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="rounded-full bg-primary/10 p-3 mb-3 w-fit">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h3 className="font-medium mb-2">Configure Data</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your components to data sources and customize their appearance.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="rounded-full bg-primary/10 p-3 mb-3 w-fit">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h3 className="font-medium mb-2">Integrate & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with database analytics and share dashboards with your team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 