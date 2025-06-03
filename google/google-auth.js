const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

let authClient = null;
let sheetsClient = null;

async function getAuthClient() {
  if (authClient) return authClient;

  const jsonPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const credentials = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive.file'],
  });

  authClient = await auth.getClient();
  return authClient;
}

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const client = await getAuthClient();
  sheetsClient = google.sheets({ version: 'v4', auth: client });

  return sheetsClient;
}

module.exports = {
  getAuthClient,
  getSheetsClient,
  authClient: getAuthClient, // сумісність зі старим імпортом
};
