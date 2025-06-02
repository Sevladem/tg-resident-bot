const { getSheetsClient } = require('./google/google-auth');
require('dotenv').config();

(async () => {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'users',
  });

  console.log(res.data);
})();