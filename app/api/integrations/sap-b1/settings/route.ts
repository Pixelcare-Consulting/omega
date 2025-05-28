import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get SAP Service Layer settings from environment variables
    const sapSettings = {
      serviceLayerUrl: process.env.SAP_BASE_URL || '',
      companyDB: process.env.SAP_COMPANY_DB || '',
      username: process.env.SAP_USERNAME || '',
      password: process.env.SAP_PASSWORD || '',
      language: 'en-US',
      useTLS: true
    };

    return NextResponse.json({
      success: true,
      settings: sapSettings
    });
  } catch (error) {
    console.error('Error fetching SAP settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch SAP settings' 
      }, 
      { status: 500 }
    );
  }
}
