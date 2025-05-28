import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import axios from 'axios';

async function testSAPConnection(url: string, companyDB: string, username: string, password: string) {
  try {
    // Clean URL (remove trailing slash if present)
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    // Construct login URL - use the correct SAP Service Layer endpoint
    const loginUrl = `${cleanUrl}/b1s/v1/Login`;

    // Create HTTPS agent that bypasses SSL certificate validation
    const agent = new https.Agent({
      rejectUnauthorized: false,
      timeout: 30000, // 30 second timeout
    });

    // Attempt to login to SAP B1 Service Layer
    const response = await axios.post(loginUrl, {
      CompanyDB: companyDB,
      UserName: username,
      Password: password,
    }, {
      httpsAgent: agent,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
    }

    // Get session cookies from response headers
    const setCookieHeader = response.headers['set-cookie'];
    let b1sessionCookie = '';

    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        if (cookie.startsWith('B1SESSION=')) {
          b1sessionCookie = cookie.split(';')[0];
        }
      });
    }

    if (!b1sessionCookie) {
      throw new Error('No session ID received from SAP B1');
    }

    return {
      success: true,
      message: 'Successfully connected to SAP B1 Service Layer',
      sessionId: b1sessionCookie
    };
  } catch (error: any) {
    console.error('SAP B1 connection test failed:', error);

    // Handle axios-specific errors
    let errorMessage = 'Failed to connect to SAP B1';
    if (error.code === 'CERT_HAS_EXPIRED') {
      errorMessage = 'SSL certificate has expired - connection should be bypassed by HTTPS agent';
    } else if (error.response) {
      errorMessage = `SAP Service Layer returned error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
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