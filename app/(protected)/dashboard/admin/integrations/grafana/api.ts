import { toast } from '@/components/ui/use-toast';

export interface GrafanaConfig {
  url: string;
  apiKey: string;
  orgId?: string;
  autoSync: boolean;
}

export interface GrafanaDashboard {
  id: string;
  uid: string;
  title: string;
  url: string;
  panels: number;
  lastUpdated: string;
  starred: boolean;
}

export interface GrafanaDataSource {
  id: number;
  name: string;
  type: string;
  url: string;
  isDefault: boolean;
}

// Store connection configuration in local storage
export const saveGrafanaConfig = (config: GrafanaConfig): void => {
  try {
    localStorage.setItem('grafana_config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save Grafana config:', error);
    toast({
      title: 'Error saving configuration',
      description: 'Could not save Grafana configuration to local storage',
      variant: 'destructive'
    });
  }
};

// Retrieve stored configuration
export const getGrafanaConfig = (): GrafanaConfig | null => {
  try {
    const config = localStorage.getItem('grafana_config');
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Failed to retrieve Grafana config:', error);
    return null;
  }
};

// Clear stored configuration on disconnect
export const clearGrafanaConfig = (): void => {
  try {
    localStorage.removeItem('grafana_config');
  } catch (error) {
    console.error('Failed to clear Grafana config:', error);
  }
};

// Test connection to Grafana
export const testGrafanaConnection = async (config: GrafanaConfig): Promise<boolean> => {
  try {
    // In a real implementation, this would make an API call to Grafana
    // For now, we'll simulate a successful connection if URL and API key are provided
    if (!config.url || !config.apiKey) {
      throw new Error('URL and API key are required');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a production environment, you would make a real API call like:
    // const response = await fetch(`${config.url}/api/health`, {
    //   headers: {
    //     Authorization: `Bearer ${config.apiKey}`,
    //   },
    // });
    // return response.ok;
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Grafana:', error);
    toast({
      title: 'Connection failed',
      description: error instanceof Error ? error.message : 'Could not connect to Grafana',
      variant: 'destructive'
    });
    return false;
  }
};

// Fetch dashboards from Grafana
export const fetchGrafanaDashboards = async (config: GrafanaConfig): Promise<GrafanaDashboard[]> => {
  try {
    // In a real implementation, this would fetch actual dashboards from Grafana API
    // For now, we'll return mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data
    return [
      {
        id: '1',
        uid: 'abc123',
        title: 'System Overview',
        url: `${config.url}/d/abc123/system-overview`,
        panels: 8,
        lastUpdated: '2023-11-10T14:32:00Z',
        starred: true,
      },
      {
        id: '2',
        uid: 'def456',
        title: 'User Analytics',
        url: `${config.url}/d/def456/user-analytics`,
        panels: 6,
        lastUpdated: '2023-11-05T09:15:00Z',
        starred: false,
      },
      {
        id: '3',
        uid: 'ghi789',
        title: 'Performance Metrics',
        url: `${config.url}/d/ghi789/performance-metrics`,
        panels: 12,
        lastUpdated: '2023-11-08T16:45:00Z',
        starred: true,
      },
    ];
  } catch (error) {
    console.error('Failed to fetch Grafana dashboards:', error);
    toast({
      title: 'Error fetching dashboards',
      description: 'Could not retrieve dashboards from Grafana',
      variant: 'destructive'
    });
    return [];
  }
};

// Fetch data sources from Grafana
export const fetchGrafanaDataSources = async (config: GrafanaConfig): Promise<GrafanaDataSource[]> => {
  try {
    // In a real implementation, this would fetch actual data sources from Grafana API
    // For now, we'll return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    return [
      {
        id: 1,
        name: 'PostgreSQL',
        type: 'postgres',
        url: 'postgres://user:password@localhost:5432/mydatabase',
        isDefault: true,
      },
      {
        id: 2,
        name: 'Prometheus',
        type: 'prometheus',
        url: 'http://prometheus:9090',
        isDefault: false,
      },
      {
        id: 3,
        name: 'InfluxDB',
        type: 'influxdb',
        url: 'http://influxdb:8086',
        isDefault: false,
      },
    ];
  } catch (error) {
    console.error('Failed to fetch Grafana data sources:', error);
    toast({
      title: 'Error fetching data sources',
      description: 'Could not retrieve data sources from Grafana',
      variant: 'destructive'
    });
    return [];
  }
};

// Import a dashboard from Grafana to the application
export const importDashboard = async (dashboard: GrafanaDashboard): Promise<boolean> => {
  try {
    // In a real implementation, this would import the dashboard configuration
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Dashboard imported',
      description: `Successfully imported "${dashboard.title}" dashboard`
    });
    
    return true;
  } catch (error) {
    console.error('Failed to import dashboard:', error);
    toast({
      title: 'Import failed',
      description: `Could not import "${dashboard.title}" dashboard`,
      variant: 'destructive'
    });
    return false;
  }
};

// Connect custom dashboard builder with Grafana
export interface CustomDashboardConfig {
  id: string;
  name: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    settings: Record<string, any>;
  }>;
  dataSource?: string;
  grafanaPanel?: string;
}

// Save custom dashboard config to Grafana
export const saveCustomDashboardToGrafana = async (
  config: GrafanaConfig,
  dashboard: CustomDashboardConfig
): Promise<boolean> => {
  try {
    if (!config.url || !config.apiKey) {
      throw new Error('Grafana connection not configured');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // In a real implementation, this would create a dashboard in Grafana using their API
    // For example:
    // const response = await fetch(`${config.url}/api/dashboards/db`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     dashboard: {
    //       id: null,
    //       title: dashboard.name,
    //       tags: ['custom-builder', 'omega'],
    //       timezone: 'browser',
    //       panels: dashboard.fields.map((field, index) => ({
    //         id: index + 1,
    //         title: field.name,
    //         type: getGrafanaPanelType(field.type),
    //         datasource: dashboard.dataSource || 'PostgreSQL',
    //         // Additional panel configuration based on field type
    //       })),
    //       // Additional dashboard settings
    //     },
    //     folderId: 0,
    //     overwrite: false
    //   }),
    // });
    // return response.ok;
    
    toast({
      title: 'Dashboard exported to Grafana',
      description: `Successfully exported "${dashboard.name}" to Grafana`
    });
    
    return true;
  } catch (error) {
    console.error('Failed to save custom dashboard to Grafana:', error);
    toast({
      title: 'Export failed',
      description: error instanceof Error ? error.message : 'Could not export dashboard to Grafana',
      variant: 'destructive'
    });
    return false;
  }
};

// Get appropriate Grafana panel type based on field type
export const getGrafanaPanelType = (fieldType: string): string => {
  switch (fieldType) {
    case 'number':
    case 'integer':
      return 'stat';
    case 'datetime':
    case 'date':
      return 'timeseries';
    case 'boolean':
      return 'gauge';
    case 'array':
    case 'object':
      return 'table';
    default:
      return 'text';
  }
};

// Import Grafana dashboard as custom dashboard config
export const importGrafanaDashboardAsCustom = async (
  config: GrafanaConfig,
  dashboardUid: string
): Promise<CustomDashboardConfig | null> => {
  try {
    if (!config.url || !config.apiKey) {
      throw new Error('Grafana connection not configured');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would fetch the dashboard from Grafana using their API
    // For example:
    // const response = await fetch(`${config.url}/api/dashboards/uid/${dashboardUid}`, {
    //   headers: {
    //     'Authorization': `Bearer ${config.apiKey}`,
    //   },
    // });
    // const data = await response.json();
    // const dashboard = data.dashboard;
    
    // Mock data for the example
    const customDashboard: CustomDashboardConfig = {
      id: `imported-${dashboardUid}`,
      name: "Imported Grafana Dashboard",
      fields: [
        {
          id: "field1",
          name: "Total Users",
          type: "number",
          settings: { 
            color: "blue",
            showTrend: true
          }
        },
        {
          id: "field2",
          name: "Activity Timeline",
          type: "datetime",
          settings: {
            timeRange: "last24hours"
          }
        },
        {
          id: "field3",
          name: "System Status",
          type: "boolean",
          settings: {
            trueLabel: "Online",
            falseLabel: "Offline"
          }
        }
      ],
      dataSource: "PostgreSQL",
      grafanaPanel: dashboardUid
    };
    
    toast({
      title: 'Dashboard imported',
      description: `Successfully imported Grafana dashboard as custom dashboard`
    });
    
    return customDashboard;
  } catch (error) {
    console.error('Failed to import Grafana dashboard:', error);
    toast({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import Grafana dashboard',
      variant: 'destructive'
    });
    return null;
  }
}; 