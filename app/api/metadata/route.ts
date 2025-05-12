import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { defaultMetadata } from '@/app/lib/metadata';

let metadataStore = { ...defaultMetadata };

export async function GET() {
  try {
    return NextResponse.json(metadataStore);
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return NextResponse.json({ error: 'Could not retrieve metadata' }, { status: 500 });
  }
}

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
    
    // Update metadata store
    if (data.systemName) {
      metadataStore = {
        ...metadataStore,
        title: data.systemName,
        applicationName: data.systemName,
      };
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Metadata updated successfully',
      metadata: metadataStore
    });
  } catch (error) {
    console.error('Failed to update metadata:', error);
    return NextResponse.json({ error: 'Could not update metadata' }, { status: 500 });
  }
} 