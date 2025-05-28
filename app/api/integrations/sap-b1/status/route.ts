import { NextResponse } from 'next/server';
import fs from 'fs';
import ini from 'ini';
import https from 'https';
import axios from 'axios';

const TOKEN_FILE_PATH = './SAP-Service-Layer-Authorization-Token.ini';

interface SapTokenConfig {
  b1session?: string;
  routeid?: string;
  GeneratedAt?: number;
}

export async function GET(request: Request) {
  try {
    // Check if SAP credentials are configured
    const sapBaseUrl = process.env.SAP_BASE_URL;
    const sapCompanyDB = process.env.SAP_COMPANY_DB;
    const sapUsername = process.env.SAP_USERNAME;
    const sapPassword = process.env.SAP_PASSWORD;
    const sapMockMode = process.env.SAP_MOCK_MODE === 'true';

    if (!sapBaseUrl || !sapCompanyDB || !sapUsername || !sapPassword) {
      return NextResponse.json({
        status: 'disconnected',
        expirationTime: null,
        error: 'SAP credentials not configured',
        tokenInfo: null
      });
    }

    // If in mock mode, return simulated connected status
    if (sapMockMode) {
      return NextResponse.json({
        status: 'connected',
        expirationTime: Date.now() + 30 * 60 * 1000, // 30 minutes from now
        tokenStatus: 'valid',
        tokenInfo: {
          hasB1Session: true,
          hasRouteId: true,
          generatedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
          b1sessionPreview: 'B1SESSION=mock-session-token-12345...',
          routeidPreview: 'ROUTEID=mock-route-id-67890...'
        },
        credentials: {
          baseUrl: sapBaseUrl,
          companyDB: sapCompanyDB,
          username: sapUsername
        },
        mockMode: true
      });
    }

    // Check if token file exists and read token information
    let tokenInfo: SapTokenConfig | null = null;
    let tokenStatus = 'no-token';
    let calculatedExpiration: number | null = null;

    if (fs.existsSync(TOKEN_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
        tokenInfo = ini.parse(fileContent);

        if (tokenInfo.GeneratedAt && tokenInfo.b1session && tokenInfo.routeid) {
          // Convert GeneratedAt to number if it's a string (from INI parsing)
          const generatedAtTimestamp = typeof tokenInfo.GeneratedAt === 'string'
            ? parseInt(tokenInfo.GeneratedAt, 10)
            : tokenInfo.GeneratedAt;

          // Validate that we have a valid timestamp
          const currentTime = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          const maxFuture = 5 * 60 * 1000; // Allow 5 minutes in the future for clock skew

          // Debug token validation (remove in production)
          // console.log('Token validation:', {
          //   generatedAtTimestamp,
          //   currentTime,
          //   generatedDate: new Date(generatedAtTimestamp).toISOString(),
          //   currentDate: new Date(currentTime).toISOString(),
          //   ageDiff: currentTime - generatedAtTimestamp,
          //   maxAge
          // });

          if (!isNaN(generatedAtTimestamp) &&
              generatedAtTimestamp > 0 &&
              generatedAtTimestamp <= (currentTime + maxFuture) &&
              (currentTime - generatedAtTimestamp) < maxAge) {

            // Calculate expiration (SAP tokens typically last 30 minutes)
            const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
            calculatedExpiration = generatedAtTimestamp + sessionTimeout;

            if (currentTime < calculatedExpiration) {
              tokenStatus = 'valid';
            } else {
              tokenStatus = 'expired';
            }

            // Update tokenInfo.GeneratedAt to be a proper number
            tokenInfo.GeneratedAt = generatedAtTimestamp;
          } else {
            // Invalid timestamp - treat as expired and regenerate
            // Debug invalid timestamp (remove in production)
            // console.log('Invalid timestamp detected:', {
            //   generatedAtTimestamp,
            //   isNaN: isNaN(generatedAtTimestamp),
            //   isPositive: generatedAtTimestamp > 0,
            //   isFuture: generatedAtTimestamp > (currentTime + maxFuture),
            //   isTooOld: (currentTime - generatedAtTimestamp) >= maxAge
            // });
            tokenStatus = 'invalid-timestamp';
            tokenInfo.GeneratedAt = undefined;
          }
        }
      } catch (error) {
        console.error('Error reading token file:', error);
        tokenStatus = 'error';
      }
    }

    // Test actual connection to SAP Service Layer
    let connectionStatus = 'disconnected';
    try {
      // Clean the base URL and construct the login endpoint
      const baseUrl = sapBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes
      const loginUrl = `${baseUrl}/b1s/v1/Login`;

      // Create HTTPS agent that bypasses SSL certificate validation
      const agent = new https.Agent({
        rejectUnauthorized: false,
        timeout: 30000, // 30 second timeout
      });

      const response = await axios.post(loginUrl, {
        CompanyDB: sapCompanyDB,
        UserName: sapUsername,
        Password: sapPassword,
      }, {
        httpsAgent: agent,
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        connectionStatus = 'connected';
        // If we don't have a valid token but connection works, use current time + 30 min
        if (tokenStatus !== 'valid') {
          calculatedExpiration = Date.now() + 30 * 60 * 1000;
        }
      }
    } catch (connectionError: any) {
      console.error('Connection test failed:', connectionError);
    }

    return NextResponse.json({
      status: connectionStatus,
      expirationTime: calculatedExpiration,
      tokenStatus,
      tokenInfo: tokenInfo ? {
        hasB1Session: !!tokenInfo.b1session,
        hasRouteId: !!tokenInfo.routeid,
        generatedAt: tokenInfo.GeneratedAt,
        b1sessionPreview: tokenInfo.b1session ? `${tokenInfo.b1session.substring(0, 20)}...` : null,
        routeidPreview: tokenInfo.routeid ? `${tokenInfo.routeid.substring(0, 20)}...` : null
      } : null,
      credentials: {
        baseUrl: sapBaseUrl,
        companyDB: sapCompanyDB,
        username: sapUsername
      }
    });

  } catch (error: any) {
    console.error('Error fetching SAP status:', error);
    return NextResponse.json({
      status: 'disconnected',
      expirationTime: null,
      error: 'Error fetching status',
      tokenInfo: null
    }, { status: 500 });
  }
}
