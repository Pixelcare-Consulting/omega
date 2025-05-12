import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Default settings
const defaultSettings = {
  systemSettings: {
    maintenanceMode: false,
    debugMode: false,
    systemName: 'Omega',
    defaultLocale: 'en-US',
    defaultTheme: 'light',
    grafanaUrl: '',
    grafanaApiKey: '',
    enableGrafanaEmbedding: false
  },
  dashboardSettings: {
    enableCustomDashboards: true,
    maxDashboardsPerUser: 5,
    defaultLayout: 'standard',
    showWelcomeBanner: true
  }
};

// GET /api/settings - Retrieve settings
export async function GET() {
  try {
    // Get settings from database
    const settings = await prisma.settings.findFirst({
      where: { id: 'global' }
    });

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(JSON.parse(settings.data));
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Could not retrieve settings' }, { status: 500 });
  }
}

// POST /api/settings - Save settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Merge with existing settings
    const existingSettings = await prisma.settings.findFirst({
      where: { id: 'global' }
    });

    const mergedSettings = existingSettings 
      ? {
          ...JSON.parse(existingSettings.data),
          systemSettings: {
            ...JSON.parse(existingSettings.data).systemSettings,
            ...data.systemSettings
          },
          dashboardSettings: {
            ...JSON.parse(existingSettings.data).dashboardSettings,
            ...data.dashboardSettings
          }
        }
      : {
          ...defaultSettings,
          systemSettings: {
            ...defaultSettings.systemSettings,
            ...data.systemSettings
          },
          dashboardSettings: {
            ...defaultSettings.dashboardSettings,
            ...data.dashboardSettings
          }
        };

    // Save to database using upsert
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        data: JSON.stringify(mergedSettings),
        updatedAt: new Date(),
        updatedBy: session.user.id
      },
      create: {
        id: 'global',
        data: JSON.stringify(mergedSettings),
        createdBy: session.user.id,
        updatedBy: session.user.id
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Could not save settings' }, { status: 500 });
  }
} 