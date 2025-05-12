import { Metadata } from 'next';
import { prisma } from '@/lib/db';

// Default metadata configuration
export const defaultMetadata: Metadata = {
  title: 'Omega',
  description: 'Omega PXC Development Build',
  applicationName: 'Omega',
  authors: [{ name: 'Omega Team' }],
  keywords: ['Omega', 'Dashboard', 'Management System'],
};

// Helper function to get base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Get current metadata configuration
export async function getMetadata(): Promise<Metadata> {
  try {
    // Get settings directly from database
    const settings = await prisma.settings.findFirst({
      where: { id: 'global' }
    });

    if (!settings) {
      return defaultMetadata;
    }

    const data = JSON.parse(settings.data);
    
    // Check if data.systemSettings exists before accessing systemName
    if (!data || !data.systemSettings || !data.systemSettings.systemName) {
      console.warn('System settings or systemName is missing, using default metadata');
      return defaultMetadata;
    }
    
    return {
      ...defaultMetadata,
      title: data.systemSettings.systemName,
      applicationName: data.systemSettings.systemName,
    };
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return defaultMetadata;
  }
}

// Update metadata configuration
export async function updateMetadata(systemName: string): Promise<void> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemName }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }
  } catch (error) {
    console.error('Failed to update metadata:', error);
    throw error;
  }
} 