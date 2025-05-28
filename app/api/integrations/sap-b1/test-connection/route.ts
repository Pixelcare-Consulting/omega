import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sapLogger } from '@/lib/logger';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sapBaseUrl = process.env.SAP_BASE_URL;
    const sapCompanyDB = process.env.SAP_COMPANY_DB;
    const sapUsername = process.env.SAP_USERNAME;
    const sapPassword = process.env.SAP_PASSWORD;
    const sapMockMode = process.env.SAP_MOCK_MODE === 'true';

    if (!sapBaseUrl || !sapCompanyDB || !sapUsername || !sapPassword) {
      return NextResponse.json({
        success: false,
        error: 'SAP credentials not configured in environment variables',
        details: {
          hasBaseUrl: !!sapBaseUrl,
          hasCompanyDB: !!sapCompanyDB,
          hasUsername: !!sapUsername,
          hasPassword: !!sapPassword
        }
      });
    }

    // If in mock mode, return simulated successful connection
    if (sapMockMode) {
      sapLogger.info('SAP connection test (MOCK MODE)', {
        mockMode: true,
        userId: session.user.id
      });

      return NextResponse.json({
        success: true,
        message: 'Successfully connected to SAP Service Layer (MOCK MODE)',
        details: {
          status: 200,
          statusText: 'OK',
          url: `${sapBaseUrl}/b1s/v1/Login`,
          companyDB: sapCompanyDB,
          username: sapUsername,
          mockMode: true,
          responseHeaders: {
            'content-type': 'application/json',
            'set-cookie': 'B1SESSION=mock-session-token; ROUTEID=mock-route-id'
          }
        }
      });
    }

    // Clean the base URL and construct the login endpoint
    const baseUrl = sapBaseUrl.replace(/\/+$/, '');
    const loginUrl = `${baseUrl}/b1s/v1/Login`;

    sapLogger.info('Testing SAP connection', {
      url: loginUrl,
      companyDB: sapCompanyDB,
      username: sapUsername,
      userId: session.user.id
    });

    // Test connection with detailed error handling
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          CompanyDB: sapCompanyDB,
          UserName: sapUsername,
          Password: sapPassword
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json();

        sapLogger.info('SAP connection test successful', {
          status: response.status,
          userId: session.user.id
        });

        return NextResponse.json({
          success: true,
          message: 'Successfully connected to SAP Service Layer',
          details: {
            status: response.status,
            statusText: response.statusText,
            url: loginUrl,
            companyDB: sapCompanyDB,
            username: sapUsername,
            responseHeaders: Object.fromEntries(response.headers.entries())
          }
        });
      } else {
        const errorText = await response.text();

        sapLogger.error('SAP connection test failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          userId: session.user.id
        });

        return NextResponse.json({
          success: false,
          error: `SAP Service Layer returned error: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            url: loginUrl,
            companyDB: sapCompanyDB,
            username: sapUsername,
            errorResponse: errorText
          }
        });
      }
    } catch (fetchError: any) {
      let errorMessage = 'Unknown connection error';
      let errorType = 'UNKNOWN';

      if (fetchError.name === 'AbortError') {
        errorMessage = 'Connection timeout (15 seconds) - SAP server may be unreachable';
        errorType = 'TIMEOUT';
      } else if (fetchError.code === 'ENOTFOUND') {
        errorMessage = 'DNS resolution failed - hostname not found';
        errorType = 'DNS_ERROR';
      } else if (fetchError.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused - SAP server may be down or port blocked';
        errorType = 'CONNECTION_REFUSED';
      } else if (fetchError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timeout - SAP server may be unreachable';
        errorType = 'TIMEOUT';
      } else if (fetchError.code === 'ECONNRESET') {
        errorMessage = 'Connection reset - network issue or server problem';
        errorType = 'CONNECTION_RESET';
      } else {
        errorMessage = fetchError.message || 'Unknown error';
        errorType = fetchError.code || 'UNKNOWN';
      }

      sapLogger.error('SAP connection test failed with network error', {
        errorType,
        errorMessage,
        errorCode: fetchError.code,
        url: loginUrl,
        userId: session.user.id
      });

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: {
          errorType,
          errorCode: fetchError.code,
          url: loginUrl,
          companyDB: sapCompanyDB,
          username: sapUsername,
          troubleshooting: {
            'TIMEOUT': 'Check if SAP server is running and accessible from this network',
            'DNS_ERROR': 'Verify the SAP server hostname/IP address is correct',
            'CONNECTION_REFUSED': 'Check if SAP Service Layer is running on port 50000',
            'CONNECTION_RESET': 'Network connectivity issue - check firewall settings'
          }[errorType] || 'Check SAP server configuration and network connectivity'
        }
      });
    }

  } catch (error: any) {
    sapLogger.error('SAP connection test endpoint error', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error during connection test'
    }, { status: 500 });
  }
}
