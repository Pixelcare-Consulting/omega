import axios from 'axios';
import https from 'https';
import { getSapServiceLayerToken } from './sap-auth';
import { sapLogger } from './logger'; // Import the logger

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
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.post(`${credentials.BaseURL}/b1s/v1/Login`, {
      CompanyDB: credentials.CompanyDB,
      UserName: credentials.UserName,
      Password: credentials.Password,
    }, {
      httpsAgent: agent,
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

    return {
      b1session: b1sessionCookie,
      routeid: routeidCookie,
    };
  } catch (error: any) {
    sapLogger.error(`SAP Service Layer authentication failed: ${error.message}`);
    throw new Error(`SAP Service Layer authentication failed: ${error.message}`);
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
