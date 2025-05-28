import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';

const TOKEN_FILE_PATH = './SAP-Service-Layer-Authorization-Token.ini';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the existing token file if it exists
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      try {
        fs.unlinkSync(TOKEN_FILE_PATH);
        console.log('SAP token file deleted successfully');
      } catch (error) {
        console.error('Error deleting SAP token file:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to delete existing token file'
        }, { status: 500 });
      }
    }

    // Import the SAP auth function (only in Node.js environment)
    if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
      try {
        const { getSapServiceLayerToken } = await import('@/lib/sap-auth');
        
        // Generate a fresh SAP token
        const tokenResult = await getSapServiceLayerToken();
        
        return NextResponse.json({
          success: true,
          message: 'SAP token reset and regenerated successfully',
          tokenPreview: {
            b1session: tokenResult.b1session ? `${tokenResult.b1session.substring(0, 20)}...` : null,
            routeid: tokenResult.routeid ? `${tokenResult.routeid.substring(0, 20)}...` : null,
            generatedAt: Date.now()
          }
        });
      } catch (error: any) {
        console.error('Error generating new SAP token:', error);
        return NextResponse.json({
          success: false,
          error: `Failed to generate new SAP token: ${error.message}`
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'SAP token generation not available in this environment'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in SAP token reset endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
