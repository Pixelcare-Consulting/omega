import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import the SAP auth function (only in Node.js environment)
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      try {
        const { getSapServiceLayerToken } = await import('@/lib/sap-auth');
        
        // Generate or refresh the SAP token
        const tokenResult = await getSapServiceLayerToken();
        
        return NextResponse.json({
          success: true,
          message: 'SAP token generated/refreshed successfully',
          tokenPreview: {
            b1session: tokenResult.b1session ? `${tokenResult.b1session.substring(0, 20)}...` : null,
            routeid: tokenResult.routeid ? `${tokenResult.routeid.substring(0, 20)}...` : null,
            generatedAt: Date.now()
          }
        });
      } catch (error: any) {
        console.error('Error generating SAP token:', error);
        return NextResponse.json({
          success: false,
          error: `Failed to generate SAP token: ${error.message}`
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'SAP token generation not available in this environment'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in SAP token endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
