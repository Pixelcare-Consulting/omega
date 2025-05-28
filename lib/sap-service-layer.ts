import axios from 'axios';
import https from 'https';
import { getSapServiceLayerToken } from './sap-auth';

interface SAPCredentials {
  BaseURL: string;
  CompanyDB: string;
  UserName: string;
  Password: string;
}

interface SAPSession {
  SessionId: string;
  SessionTimeout: number;
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

    const { SessionId, SessionTimeout } = response.data;

    return {
      SessionId,
      SessionTimeout,
    };
  } catch (error: any) {
    console.error('SAP Service Layer authentication failed:', error.message);
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

    // Get the SAP Service Layer authorization token
    const authToken = await getSapServiceLayerToken();

    if (!authToken) {
      throw new Error('SAP Service Layer authorization token not available.');
    }

    const response = await axios.get(url, {
      headers: {
        'Cookie': `
        B1SESSION=${authToken};
        B1SESSION_TIMEOUT=${authToken};
        ROUTEID=${authToken};`,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error calling SAP Service Layer API:', error.message);
    throw new Error(`Error calling SAP Service Layer API: ${error.message}`);
  }
}
