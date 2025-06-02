const { getSheetsClient } = require('./google-auth');

async function readSheet(sheetName) {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}`,
  });
  return response.data.values || [];
}

module.exports = {
  readSheet,
};