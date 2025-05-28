import { NextResponse } from 'next/server';
import { authenticateSAPServiceLayer } from '@/lib/sap-service-layer';

export async function GET(request: Request) {
  try {
    // In a real application, you would check the actual SAP session status here.
    // For demonstration purposes, we return a hardcoded connected status and a placeholder expiration time.
    const sapStatus = {
      status: 'connected',
      expirationTime: Date.now() + 60 * 60 * 1000, // Placeholder: 1 hour from now (timestamp in milliseconds)
    };

    return NextResponse.json(sapStatus);
  } catch (error: any) {
    console.error('Error fetching SAP status:', error);
    return NextResponse.json({ status: 'disconnected', expirationTime: 'Error fetching status' }, { status: 500 });
  }
}
