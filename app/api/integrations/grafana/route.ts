import { NextRequest, NextResponse } from 'next/server';

// Mock dashboard data for demonstration
const mockDashboards = [
  {
    id: 'dashboard-1',
    uid: 'abc123',
    title: 'System Overview',
    fields: Array(5).fill({ id: 'field', name: 'Field' }),
    tables: Array(3).fill({ id: 'table', name: 'Table' }),
    charts: Array(8).fill({ id: 'chart', name: 'Chart' }),
    dataSource: 'PostgreSQL'
  },
  {
    id: 'dashboard-2',
    uid: 'def456',
    title: 'User Analytics',
    fields: Array(7).fill({ id: 'field', name: 'Field' }),
    tables: Array(4).fill({ id: 'table', name: 'Table' }),
    charts: Array(6).fill({ id: 'chart', name: 'Chart' }),
    dataSource: 'Prometheus'
  },
  {
    id: 'dashboard-3',
    uid: 'ghi789',
    title: 'Performance Metrics',
    fields: Array(9).fill({ id: 'field', name: 'Field' }),
    tables: Array(2).fill({ id: 'table', name: 'Table' }),
    charts: Array(10).fill({ id: 'chart', name: 'Chart' }),
    dataSource: 'InfluxDB'
  }
];

// Get Grafana URL - get from settings API
const getGrafanaUrl = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/settings`);
    const data = await response.json();
    return data.systemSettings?.grafanaUrl || process.env.GRAFANA_URL || 'https://gmjsilmaro.grafana.net';
  } catch (error) {
    console.error("Error fetching Grafana URL from settings:", error);
    return process.env.GRAFANA_URL || 'https://gmjsilmaro.grafana.net';
  }
};

// Get Grafana API key - get from settings API
const getGrafanaApiKey = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/settings`);
    const data = await response.json();
    return data.systemSettings?.grafanaApiKey || process.env.GRAFANA_API_KEY || '';
  } catch (error) {
    console.error("Error fetching Grafana API key from settings:", error);
    return process.env.GRAFANA_API_KEY || '';
  }
};

// Save Grafana configuration to settings
const saveGrafanaConfig = async (url: string, apiKey: string, enableEmbedding: boolean = true) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemSettings: {
          grafanaUrl: url,
          grafanaApiKey: apiKey,
          enableGrafanaEmbedding: enableEmbedding
        }
      })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error saving Grafana config to settings:", error);
    return false;
  }
};

async function validateGrafanaConnection(url: string, apiKey: string) {
  try {
    // Validate URL and API key
    if (!url) {
      return { success: false, error: 'Grafana URL is required' };
    }
    
    if (!apiKey) {
      return { success: false, error: 'Grafana API key is required' };
    }
    
    // Clean URL (remove trailing slash if present)
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // In a real implementation, we would make an actual API call to Grafana
    // For this demo, we'll simulate a network request with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different connection scenarios based on URL for testing purposes
    if (cleanUrl.includes('error')) {
      return { success: false, error: 'Connection refused' };
    }
    
    if (cleanUrl.includes('timeout')) {
      return { success: false, error: 'Connection timed out' };
    }
    
    if (cleanUrl.includes('unauthorized') || apiKey === 'invalid') {
      return { success: false, error: 'Authentication failed - invalid API key' };
    }
    
    // Save credentials to settings on successful connection
    await saveGrafanaConfig(cleanUrl, apiKey, true);
    
    // Simulate successful connection
    return { 
      success: true, 
      version: '10.1.2',
      message: 'Successfully connected to Grafana'
    };
  } catch (error) {
    console.error('Failed to connect to Grafana:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Could not connect to Grafana server' 
    };
  }
}

async function fetchGrafanaDashboards(url: string, apiKey: string) {
  try {
    // In a real implementation, you would call the Grafana API to fetch actual dashboards
    // For demo purposes, we're returning mock data
    
    if (!url || !apiKey) {
      return { success: false, error: 'Invalid URL or API key' };
    }

    // Simulate successful dashboard fetch
    return { 
      success: true, 
      dashboards: mockDashboards
    };
  } catch (error) {
    console.error('Failed to fetch Grafana dashboards:', error);
    return { 
      success: false, 
      error: 'Could not retrieve dashboards from Grafana server' 
    };
  }
}

async function getAllDashboards(customUrl?: string, customApiKey?: string) {
  try {
    // Get stored connection details from settings or use provided custom values
    const url = customUrl || await getGrafanaUrl();
    const apiKey = customApiKey || await getGrafanaApiKey();
    
    if (!url || !apiKey) {
      return { success: false, error: 'Grafana connection details not available' };
    }
    
    // Fetch real dashboards from Grafana API
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const response = await fetch(`${cleanUrl}/api/search?type=dash-db`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch dashboards: ${response.status}`);
    }
    
    const dashboards = await response.json();
    
    // Add embed URL to each dashboard
    const dashboardsWithUrls = dashboards.map((dashboard: any) => ({
      id: dashboard.id,
      uid: dashboard.uid,
      title: dashboard.title,
      url: `${cleanUrl}/d/${dashboard.uid}?orgId=1&kiosk&theme=light`,
      description: dashboard.tags?.join(', ') || ''
    }));
 
    return { 
      success: true, 
      grafanaUrl: url,
      dashboards: dashboardsWithUrls
    };
  } catch (error) {
    console.error('Failed to get all dashboards:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Could not retrieve dashboards' 
    };
  }
}

async function getDashboards() {
  try {
    // Get stored connection details from settings
    const url = await getGrafanaUrl();
    const apiKey = await getGrafanaApiKey();
    
    // Use the getAllDashboards function to get real dashboards
    return await getAllDashboards(url, apiKey);
  } catch (error) {
    console.error('Failed to get dashboards:', error);
    return { 
      success: false, 
      error: 'Could not retrieve dashboards' 
    };
  }
}

async function getDashboard(dashboardId: string, customUrl?: string, customApiKey?: string) {
  try {
    // Get stored connection details from settings or use provided custom values
    const url = customUrl || await getGrafanaUrl();
    const apiKey = customApiKey || await getGrafanaApiKey();
    
    // Find the requested dashboard
    const dashboard = mockDashboards.find(d => d.id === dashboardId || d.uid === dashboardId);
    
    if (!dashboard) {
      return { 
        success: false, 
        error: 'Dashboard not found' 
      };
    }

    // Construct the embedded URL with proper formatting for iframe embedding
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const embedUrl = `${cleanUrl}/d/${dashboard.uid || dashboard.id}?orgId=1&kiosk&theme=light`;
    
    // Add the URL to the dashboard object
    const dashboardWithUrl = {
      ...dashboard,
      url: embedUrl
    };
    
    return { 
      success: true, 
      grafanaUrl: url,
      dashboard: dashboardWithUrl
    };
  } catch (error) {
    console.error('Failed to get dashboard:', error);
    return { 
      success: false, 
      error: 'Could not retrieve dashboard' 
    };
  }
}

// Handle Grafana API requests
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, url, apiKey } = data;

    switch (action) {
      case 'validateConnection':
        return NextResponse.json(await validateGrafanaConnection(url, apiKey));
        
      case 'getDashboards':
        const dashboardsResult = await getDashboards();
        if (!dashboardsResult.success) {
          console.error('Failed to get all dashboards:', dashboardsResult.error);
        }
        return NextResponse.json(dashboardsResult);
        
      case 'getDashboard':
        const { dashboardId } = data;
        if (!dashboardId) {
          return NextResponse.json({ 
            success: false, 
            error: 'Dashboard ID is required' 
          });
        }
        return NextResponse.json(await getDashboard(dashboardId));
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action specified' 
        });
    }
  } catch (error) {
    console.error('Error in Grafana API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
} 