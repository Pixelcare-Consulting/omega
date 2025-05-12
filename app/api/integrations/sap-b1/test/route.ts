import { NextRequest, NextResponse } from 'next/server';

async function testSAPConnection(url: string, companyDB: string, username: string, password: string) {
  try {
    // Clean URL (remove trailing slash if present)
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Construct login URL
    const loginUrl = `${cleanUrl}/Login`;
    
    // Prepare login payload
    const payload = {
      CompanyDB: companyDB,
      UserName: username,
      Password: password
    };

    // Attempt to login to SAP B1 Service Layer
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to connect: ${response.status}`);
    }

    // Get session ID from response
    const sessionId = response.headers.get('B1SESSION');
    
    if (!sessionId) {
      throw new Error('No session ID received from SAP B1');
    }

    return {
      success: true,
      message: 'Successfully connected to SAP B1 Service Layer',
      sessionId
    };
  } catch (error) {
    console.error('SAP B1 connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to SAP B1'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, companyDB, username, password } = await request.json();

    // Validate required fields
    if (!url) {
      return NextResponse.json({ success: false, error: 'Service Layer URL is required' });
    }
    if (!companyDB) {
      return NextResponse.json({ success: false, error: 'Company Database is required' });
    }
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' });
    }
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' });
    }

    // Test the connection
    const result = await testSAPConnection(url, companyDB, username, password);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in SAP B1 test endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 