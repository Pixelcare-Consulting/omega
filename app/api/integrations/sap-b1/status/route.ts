import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check if SAP credentials are configured
    const sapBaseUrl = process.env.SAP_BASE_URL;
    const sapCompanyDB = process.env.SAP_COMPANY_DB;
    const sapUsername = process.env.SAP_USERNAME;
    const sapPassword = process.env.SAP_PASSWORD;

    if (!sapBaseUrl || !sapCompanyDB || !sapUsername || !sapPassword) {
      return NextResponse.json({
        status: 'disconnected',
        expirationTime: null,
        error: 'SAP credentials not configured'
      });
    }

    // Test connection to SAP Service Layer
    try {
      const loginUrl = `${sapBaseUrl}/Login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          CompanyDB: sapCompanyDB,
          UserName: sapUsername,
          Password: sapPassword
        })
      });

      if (response.ok) {
        // Connection successful
        const sapStatus = {
          status: 'connected',
          expirationTime: Date.now() + 30 * 60 * 1000, // 30 minutes from now
        };
        return NextResponse.json(sapStatus);
      } else {
        // Connection failed
        return NextResponse.json({
          status: 'disconnected',
          expirationTime: null,
          error: `Connection failed: ${response.status}`
        });
      }
    } catch (connectionError: any) {
      return NextResponse.json({
        status: 'disconnected',
        expirationTime: null,
        error: `Connection error: ${connectionError.message}`
      });
    }

  } catch (error: any) {
    console.error('Error fetching SAP status:', error);
    return NextResponse.json({
      status: 'disconnected',
      expirationTime: null,
      error: 'Error fetching status'
    }, { status: 500 });
  }
}
