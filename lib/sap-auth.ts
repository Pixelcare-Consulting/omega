import fs from 'fs';
import path from 'path';
import ini from 'ini';

// Define the path for the token file
const TOKEN_FILE_PATH = path.join(process.cwd(), 'SAP-Service-Layer-Authorization-Token.ini');

interface SapTokenConfig {
  AuthorizationToken?: string;
  ExpiresIn?: number;
  GeneratedAt?: number;
}

/**
 * Generates or retrieves a valid SAP Service Layer Authorization Token.
 * Checks if an existing token file exists and if the token is still valid.
 * If not valid or not present, generates a new token and saves it to the file.
 *
 * NOTE: In a production environment, ensure this file is stored in a secure location
 * with appropriate file permissions to prevent unauthorized access.
 * Consider encrypting the token within the file for added security.
 *
 * @returns {Promise<string>} The valid SAP Service Layer Authorization Token.
 */
export async function getSapServiceLayerToken(): Promise<string> {
  let config: SapTokenConfig = {};

  // Check if the token file exists
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
      config = ini.parse(fileContent);

      // Check if the existing token is still valid (e.g., within its expiry time)
      const generatedAt = config.GeneratedAt || 0;
      const expiresIn = config.ExpiresIn || 0;
      const currentTime = Date.now(); // Current time in milliseconds

      // Add a buffer (e.g., 60 seconds) to the expiry check to avoid using a token that's about to expire
      const expiryBuffer = 60 * 1000; // 60 seconds
      const isTokenValid = config.AuthorizationToken && (currentTime - generatedAt) < (expiresIn * 1000 - expiryBuffer);

      if (isTokenValid) {
        console.log('Using existing valid SAP Service Layer token.');
        return config.AuthorizationToken!;
      } else {
        console.log('SAP Service Layer token expired or invalid. Generating a new one.');
      }
    } catch (error) {
      console.error('Error reading or parsing SAP Service Layer token file:', error);
      console.log('Generating a new SAP Service Layer token.');
    }
  } else {
    console.log('SAP Service Layer token file not found. Generating a new token.');
  }

  // If no valid token exists, generate a new one
  const newToken = await generateNewSapServiceLayerToken(); // Implement this function
  const expiresIn = 3600; // Example expiry time in seconds (adjust based on SAP Service Layer response)

  // Update config with new token details
  config.AuthorizationToken = newToken;
  config.ExpiresIn = expiresIn;
  config.GeneratedAt = Date.now();

  // Save the new token to the file
  try {
    const newFileContent = ini.stringify(config);
    fs.writeFileSync(TOKEN_FILE_PATH, newFileContent);
    console.log('New SAP Service Layer token saved to file.');
  } catch (error) {
    console.error('Error writing SAP Service Layer token file:', error);
    // Depending on the error, you might want to throw or handle differently
  }

  return newToken;
}

/**
 * Placeholder function to generate a new SAP Service Layer token.
 * This needs to be implemented to make an actual API call to SAP Service Layer
 * to obtain a new token using appropriate credentials.
 *
 * @returns {Promise<string>} The newly generated authorization token.
 */
async function generateNewSapServiceLayerToken(): Promise<string> {
  // TODO: Implement the actual API call to SAP Service Layer to get a new token.
  // This will likely involve sending a POST request with credentials (username, password)
  // to the SAP Service Layer login endpoint.
  // Example:
  // const response = await fetch('YOUR_SAP_SERVICE_LAYER_LOGIN_URL', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     UserName: 'YOUR_USERNAME',
  //     Password: 'YOUR_PASSWORD',
  //     CompanyDB: 'YOUR_COMPANY_DB',
  //   }),
  // });
  // const data = await response.json();
  // return data.SessionId; // Or whatever the token field is in the response

  console.warn('generateNewSapServiceLayerToken is a placeholder. Implement the actual API call.');
  // Return a dummy token for now
  return 'dummy_sap_authorization_token_' + Date.now();
}

// Example usage (for testing purposes)
// async function testToken() {
//   const token = await getSapServiceLayerToken();
//   console.log('Retrieved token:', token);
// }
// testToken();
