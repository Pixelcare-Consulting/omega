'use server'

import axios from 'axios';
import https from 'https';
import { getSapServiceLayerToken } from './sap-auth';
import { sapLogger } from './logger'; // Import the logger

// This file is intended to run only on the server (Node.js environment).
// Ensure that any components or API routes importing this file are also marked as server-only
// or are configured to run in a Node.js environment to avoid issues with the edge runtime.

interface SAPCredentials {
  BaseURL: string;
  CompanyDB: string;
  UserName: string;
  Password: string;
}

interface SAPSession {
  b1session: string;
  routeid: string;
}

export async function authenticateSAPServiceLayer(credentials: SAPCredentials): Promise<SAPSession> {
  try {
    // Clean the base URL and construct the login endpoint
    const baseUrl = credentials.BaseURL.replace(/\/+$/, ''); // Remove trailing slashes
    const loginUrl = `${baseUrl}/b1s/v1/Login`;

    sapLogger.info('Attempting SAP Service Layer authentication', {
      url: loginUrl,
      companyDB: credentials.CompanyDB,
      username: credentials.UserName
    });

    const agent = new https.Agent({
      rejectUnauthorized: false,
      timeout: 30000, // 30 second timeout
    });

    const response = await axios.post(loginUrl, {
      CompanyDB: credentials.CompanyDB,
      UserName: credentials.UserName,
      Password: credentials.Password,
    }, {
      httpsAgent: agent,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const setCookieHeader = response.headers['set-cookie'];
    let b1sessionCookie = '';
    let routeidCookie = '';

    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        if (cookie.startsWith('B1SESSION=')) {
          b1sessionCookie = cookie.split(';')[0];
        } else if (cookie.startsWith('ROUTEID=')) {
          routeidCookie = cookie.split(';')[0];
        }
      });
    }

    if (!b1sessionCookie || !routeidCookie) {
      throw new Error('Failed to extract session cookies from SAP response');
    }

    sapLogger.info('SAP Service Layer authentication successful', {
      hasB1Session: !!b1sessionCookie,
      hasRouteId: !!routeidCookie
    });

    return {
      b1session: b1sessionCookie,
      routeid: routeidCookie,
    };
  } catch (error: any) {
    const errorMessage = error.code === 'ETIMEDOUT'
      ? `Connection timeout to SAP server (${credentials.BaseURL}). Please check if the server is accessible.`
      : `SAP Service Layer authentication failed: ${error.message}`;

    sapLogger.error(errorMessage, {
      errorCode: error.code,
      baseUrl: credentials.BaseURL,
      companyDB: credentials.CompanyDB,
      username: credentials.UserName
    });

    throw new Error(errorMessage);
  }
}

/**
 * Example function to make an authenticated GET request to SAP Service Layer.
 * This function retrieves the authorization token and includes it in the request headers.
 *
 * @param {string} url - The full URL of the SAP Service Layer endpoint (e.g., `${baseURL}/b1s/v1/BusinessPartners`).
 * @returns {Promise<any>} The response data from the SAP Service Layer API.
 */
export async function callSapServiceLayerApi(url: string): Promise<any> {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    // Get the SAP Service Layer authorization cookies
    const authCookies = await getSapServiceLayerToken(); // This function will be updated to return cookies

    if (!authCookies || !authCookies.b1session || !authCookies.routeid) {
      throw new Error('SAP Service Layer authorization cookies not available.');
    }

    const response = await axios.get(url, {
      headers: {
        'Cookie': `${authCookies.b1session}; ${authCookies.routeid}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    });

    return response.data;
  } catch (error: any) {
    sapLogger.error(`Error calling SAP Service Layer API: ${error.message}`);
    throw new Error(`Error calling SAP Service Layer API: ${error.message}`);
  }
}
