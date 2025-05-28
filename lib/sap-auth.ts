'use server'

import fs from 'fs';
import ini from 'ini';
import { authenticateSAPServiceLayer } from './sap-service-layer'; // Import the authentication function
import { sapLogger, authLogger } from './logger'; // Import the loggers

// This file is intended to run only on the server (Node.js environment).
// Ensure that any components or API routes importing this file are also marked as server-only
// or are configured to run in a Node.js environment to avoid issues with the edge runtime.
// Define the path for the token file
const TOKEN_FILE_PATH = './SAP-Service-Layer-Authorization-Token.ini';

interface SapTokenConfig {
  b1session?: string;
  routeid?: string;
  GeneratedAt?: number; // Timestamp when the cookies were generated
}

interface SapAuthCookies {
  b1session: string;
  routeid: string;
}

/**
 * Generates or retrieves valid SAP Service Layer Authorization Cookies.
 * Checks if an existing token file exists and if the cookies are still valid.
 * If not valid or not present, generates new cookies and saves them to the file.
 *
 * NOTE: In a production environment, ensure this file is stored in a secure location
 * with appropriate file permissions to prevent unauthorized access.
 * Consider encrypting the token within the file for added security.
 *
 * @returns {Promise<SapAuthCookies>} The valid SAP Service Layer Authorization Cookies.
 */
export async function getSapServiceLayerToken(): Promise<SapAuthCookies> {
  let config: SapTokenConfig = {};

  // Check if the token file exists
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
      config = ini.parse(fileContent);

      // Check if the existing cookies are still valid (e.g., within a reasonable time frame)
      // SAP Service Layer session timeout is typically 30 minutes (1800 seconds)
      const generatedAt = config.GeneratedAt || 0;
      const sessionTimeout = 1800 * 1000; // 30 minutes in milliseconds
      const currentTime = Date.now(); // Current time in milliseconds

      // Add a buffer (e.g., 60 seconds) to the expiry check
      const expiryBuffer = 60 * 1000; // 60 seconds
      const isTokenValid = config.b1session && config.routeid && (currentTime - generatedAt) < (sessionTimeout - expiryBuffer);

      if (isTokenValid) {
        sapLogger.info('Using existing valid SAP Service Layer cookies.');
        return {
          b1session: config.b1session!,
          routeid: config.routeid!,
        };
      } else {
        sapLogger.info('SAP Service Layer cookies expired or invalid. Generating new ones.');
      }
    } catch (error) {
      sapLogger.error(`Error reading or parsing SAP Service Layer token file: ${error}`);
      sapLogger.info('Generating new SAP Service Layer cookies.');
    }
  } else {
    sapLogger.info('SAP Service Layer token file not found. Generating new cookies.');
  }

  // If no valid cookies exist, generate new ones
  const newCookies = await generateNewSapServiceLayerToken();

  // Update config with new cookie details
  config.b1session = newCookies.b1session;
  config.routeid = newCookies.routeid;
  config.GeneratedAt = Date.now();

  // Save the new cookies to the file
  try {
    const newFileContent = ini.stringify(config);
    fs.writeFileSync(TOKEN_FILE_PATH, newFileContent);
    console.log('New SAP Service Layer cookies saved to file.');
  } catch (error) {
    sapLogger.error(`Error writing SAP Service Layer token file: ${error}`);
    // Depending on the error, you might want to throw or handle differently
  }

  return newCookies;
}

/**
 * Generates new SAP Service Layer cookies by authenticating with the service layer.
 *
 * @returns {Promise<SapAuthCookies>} The newly generated authorization cookies.
 */
async function generateNewSapServiceLayerToken(): Promise<SapAuthCookies> {
  // TODO: Replace with actual credentials from a secure source (e.g., environment variables, secrets management)
  const credentials = {
    BaseURL: process.env.SAP_BASE_URL || '', 
    CompanyDB: process.env.SAP_COMPANY_DB || '',
    UserName: process.env.SAP_USERNAME || '',
    Password: process.env.SAP_PASSWORD || '',
  };

  try {
    const session = await authenticateSAPServiceLayer(credentials);
    return {
      b1session: session.b1session,
      routeid: session.routeid,
    };
  } catch (error) {
    sapLogger.error(`Failed to generate new SAP Service Layer cookies: ${error}`);
    throw new Error('Failed to generate new SAP Service Layer cookies.');
  }
}

// Example usage (for testing purposes)
// async function testToken() {
//   const token = await getSapServiceLayerToken();
//   sapLogger.info(`Retrieved token: ${token}`);
// }
// testToken();
