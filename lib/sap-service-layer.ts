import axios from 'axios';
import https from 'https';

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
